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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let DocumentsService = class DocumentsService {
    prisma;
    storageService;
    parsingQueue;
    constructor(prisma, storageService, parsingQueue) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.parsingQueue = parsingQueue;
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
            where: { orgId, expedienteId }
        });
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