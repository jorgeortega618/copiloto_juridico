import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue('document-parsing') private readonly parsingQueue: Queue,
  ) {}

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
      where: { orgId, expedienteId }
    });
  }
}
