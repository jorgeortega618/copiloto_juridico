import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import OpenAI from 'openai';

@Injectable()
export class DocumentsService {
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue('document-parsing') private readonly parsingQueue: Queue,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
    });
  }

  async uploadDocument(orgId: string, expedienteId: string, userId: string, file: Express.Multer.File, title?: string) {
    // 1. Verify Expediente ownership
    const exp = await this.prisma.expediente.findFirst({
      where: { id: expedienteId, orgId }
    });
    if (!exp) throw new NotFoundException('Expediente not found in this organization');

    // 2. Upload file to MinIO Object Storage
    const minioKey = await this.storageService.uploadFile(orgId, expedienteId, file);

    // 3. Save Document references in SQL Node
    const doc = await this.prisma.document.create({
      data: {
        orgId,
        expedienteId,
        fileName: title || file.originalname,
        minioKey,
        status: 'PENDING',
        uploadedById: userId,
      }
    });

    // 4. Dispatch Async Parsing Job to Redis/BullMQ
    await this.parsingQueue.add('extract-text', { documentId: doc.id });

    return doc;
  }

  async getDocumentUrl(orgId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, orgId }
    });
    if (!doc) throw new NotFoundException('Document not found');

    const url = await this.storageService.getPresignedUrl(doc.minioKey);
    return { ...doc, url };
  }

  async findAllByExpediente(orgId: string, expedienteId: string) {
    return this.prisma.document.findMany({
      where: { orgId, expedienteId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(orgId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, orgId }
    });
    if (!doc) throw new NotFoundException('Document not found');

    // 1. Delete related chunks (embeddings)
    await this.prisma.$executeRaw`DELETE FROM "document_chunks" WHERE document_id = ${id}`;

    // 2. Delete related extracted text
    await this.prisma.documentText.deleteMany({ where: { documentId: id } });

    // 3. Delete the document record
    await this.prisma.document.delete({ where: { id } });

    // 4. Try to delete from MinIO (non-blocking)
    try {
      await this.storageService.deleteFile(doc.minioKey);
    } catch (e) {
      console.warn('Could not delete file from MinIO:', e);
    }

    return { deleted: true };
  }

  async aiRename(orgId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, orgId }
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Get extracted text
    const textRecord = await this.prisma.documentText.findUnique({
      where: { documentId: id }
    });
    if (!textRecord || !textRecord.rawText) {
      throw new BadRequestException('El documento aún no ha sido procesado. Espera a que termine la extracción de texto.');
    }

    // Use first 3000 chars to keep cost low
    const excerpt = textRecord.rawText.substring(0, 3000).replace(/\s+/g, ' ').trim();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de gestión documental jurídica. Tu tarea es generar un nombre descriptivo y estructurado para un documento legal basándote en su contenido.

REGLAS:
- Máximo 80 caracteres
- Usa guiones bajos (_) en lugar de espacios
- Incluye: Tipo_de_documento + Año + Partes_o_tema_principal
- Ejemplos de buenos nombres:
  "Sentencia_2015_Juzgado3Civil_Bogota_Lopez_vs_Garcia"
  "Contrato_Arrendamiento_2024_Empresa_XYZ"
  "Demanda_Laboral_2023_Martinez_Despido_Injusto"
  "Auto_Admisorio_2022_Proceso_Ejecutivo_Banco_Nacional"
- NO incluyas la extensión .pdf
- Usa español
- Si no puedes determinar el tipo, usa "Documento_Legal" como prefijo`
        },
        {
          role: 'user',
          content: `Nombre original: "${doc.fileName}"\n\nContenido (extracto):\n${excerpt}\n\nGenera SOLO el nombre (sin extensión, sin explicación):`
        }
      ]
    });

    let smartName = response.choices[0]?.message?.content?.trim() || doc.fileName;
    // Sanitize
    smartName = smartName
      .replace(/["""''`]/g, '')
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ_\-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const ext = doc.fileName.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
    const finalName = smartName + ext;

    // Update in database
    const updated = await this.prisma.document.update({
      where: { id },
      data: { fileName: finalName }
    });

    return { ...updated, previousName: doc.fileName };
  }
}
