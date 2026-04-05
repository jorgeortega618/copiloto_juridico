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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const textsplitters_1 = require("@langchain/textsplitters");
const openai_1 = __importDefault(require("openai"));
const uuid_1 = require("uuid");
const events_gateway_1 = require("../events/events.gateway");
let AiProcessor = AiProcessor_1 = class AiProcessor extends bullmq_1.WorkerHost {
    prisma;
    eventsGateway;
    logger = new common_1.Logger(AiProcessor_1.name);
    openai;
    constructor(prisma, eventsGateway) {
        super();
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
        });
    }
    async process(job) {
        const { documentId } = job.data;
        this.logger.log(`🧠 Starting Chunking & Vectorization for document ${documentId}`);
        try {
            const textRecord = await this.prisma.documentText.findUnique({
                where: { documentId },
                include: { document: true }
            });
            if (!textRecord || !textRecord.rawText) {
                throw new Error('No extracted text found for this document');
            }
            const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const docs = await splitter.createDocuments([textRecord.rawText]);
            this.logger.log(`📄 Split document into ${docs.length} chunks`);
            const embeddingsResponse = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: docs.map(d => d.pageContent),
            });
            for (let i = 0; i < embeddingsResponse.data.length; i++) {
                const embedding = embeddingsResponse.data[i].embedding;
                const pageContent = docs[i].pageContent;
                const chunkId = (0, uuid_1.v4)();
                const vectorString = `[${embedding.join(',')}]`;
                await this.prisma.$executeRaw `
          INSERT INTO "document_chunks" (id, document_id, chunk_index, content, embedding)
          VALUES (
            ${chunkId},
            ${documentId},
            ${i},
            ${pageContent},
            ${vectorString}::vector
          )
        `;
            }
            this.logger.log(`✅ Completed Vectorization for document ${documentId}`);
            if (textRecord.document?.expedienteId) {
                this.eventsGateway.server.to(textRecord.document.expedienteId).emit('document_ready', {
                    documentId,
                    status: 'READY'
                });
            }
        }
        catch (error) {
            this.logger.error(`❌ Failed AI Processing for document ${documentId}: ${error?.message || error}`);
            const failRecord = await this.prisma.document.findUnique({ where: { id: documentId } });
            if (failRecord?.expedienteId) {
                this.eventsGateway.server.to(failRecord.expedienteId).emit('document_error', {
                    documentId,
                    status: 'ERROR',
                    message: error?.message
                });
            }
            throw error;
        }
    }
};
exports.AiProcessor = AiProcessor;
exports.AiProcessor = AiProcessor = AiProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('ai-processing'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], AiProcessor);
//# sourceMappingURL=ai.processor.js.map