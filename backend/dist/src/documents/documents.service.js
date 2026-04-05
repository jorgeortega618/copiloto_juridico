"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const openai_1 = __importDefault(require("openai"));
let DocumentsService = class DocumentsService {
    prisma;
    storageService;
    parsingQueue;
    openai;
    constructor(prisma, storageService, parsingQueue) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.parsingQueue = parsingQueue;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
        });
    }
    async uploadDocument(orgId, expedienteId, userId, file, title) {
        const exp = await this.prisma.expediente.findFirst({
            where: { id: expedienteId, orgId }
        });
        if (!exp)
            throw new common_1.NotFoundException('Expediente not found in this organization');
        const minioKey = await this.storageService.uploadFile(orgId, expedienteId, file);
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
        await this.parsingQueue.add('extract-text', { documentId: doc.id });
        return doc;
    }
    async getDocumentUrl(orgId, id) {
        const doc = await this.prisma.document.findFirst({
            where: { id, orgId }
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        const url = await this.storageService.getPresignedUrl(doc.minioKey);
        return { ...doc, url };
    }
    async findAllByExpediente(orgId, expedienteId) {
        return this.prisma.document.findMany({
            where: { orgId, expedienteId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async remove(orgId, id) {
        const doc = await this.prisma.document.findFirst({
            where: { id, orgId }
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.prisma.$executeRaw `DELETE FROM "document_chunks" WHERE document_id = ${id}`;
        await this.prisma.documentText.deleteMany({ where: { documentId: id } });
        await this.prisma.document.delete({ where: { id } });
        try {
            await this.storageService.deleteFile(doc.minioKey);
        }
        catch (e) {
            console.warn('Could not delete file from MinIO:', e);
        }
        return { deleted: true };
    }
    async aiRename(orgId, id) {
        const doc = await this.prisma.document.findFirst({
            where: { id, orgId }
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        const textRecord = await this.prisma.documentText.findUnique({
            where: { documentId: id }
        });
        if (!textRecord || !textRecord.rawText) {
            throw new common_1.BadRequestException('El documento aún no ha sido procesado. Espera a que termine la extracción de texto.');
        }
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
        smartName = smartName
            .replace(/["""''`]/g, '')
            .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ_\-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        const ext = doc.fileName.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
        const finalName = smartName + ext;
        const updated = await this.prisma.document.update({
            where: { id },
            data: { fileName: finalName }
        });
        return { ...updated, previousName: doc.fileName };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('document-parsing')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        bullmq_2.Queue])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map