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
var ParserProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const pdfParse = require('pdf-parse');
let ParserProcessor = ParserProcessor_1 = class ParserProcessor extends bullmq_1.WorkerHost {
    prisma;
    storage;
    aiQueue;
    logger = new common_1.Logger(ParserProcessor_1.name);
    constructor(prisma, storage, aiQueue) {
        super();
        this.prisma = prisma;
        this.storage = storage;
        this.aiQueue = aiQueue;
    }
    async process(job) {
        const { documentId } = job.data;
        this.logger.log(`📥 Starting OCR parsing for document ${documentId}`);
        try {
            const doc = await this.prisma.document.findUnique({
                where: { id: documentId }
            });
            if (!doc || !doc.minioKey) {
                throw new Error('Document or storage reference not found');
            }
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' }
            });
            const buffer = await this.storage.getFileBuffer(doc.minioKey);
            let rawText = '';
            if (doc.minioKey.toLowerCase().endsWith('.pdf')) {
                const data = await pdfParse(buffer);
                rawText = data.text;
            }
            else {
                rawText = buffer.toString('utf-8');
            }
            await this.prisma.documentText.upsert({
                where: { documentId },
                update: { rawText },
                create: {
                    documentId,
                    rawText
                }
            });
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'COMPLETED' }
            });
            await this.aiQueue.add('generate-embeddings', { documentId });
            this.logger.log(`✅ Completed parsing for document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed parsing document ${documentId}: ${error?.message || error}`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'ERROR' }
            });
            throw error;
        }
    }
};
exports.ParserProcessor = ParserProcessor;
exports.ParserProcessor = ParserProcessor = ParserProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('document-parsing'),
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('ai-processing')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        bullmq_2.Queue])
], ParserProcessor);
//# sourceMappingURL=parser.processor.js.map