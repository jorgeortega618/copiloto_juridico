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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
let AiService = AiService_1 = class AiService {
    prisma;
    openai;
    logger = new common_1.Logger(AiService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
        });
    }
    async queryExpediente(orgId, userId, query, expedienteId) {
        if (!query)
            throw new common_1.BadRequestException('Query cannot be empty');
        const queryEmbeddingResponse = await this.openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: query,
        });
        const queryVector = queryEmbeddingResponse.data[0].embedding;
        const vectorString = `[${queryVector.join(',')}]`;
        let relevantChunks;
        if (expedienteId) {
            relevantChunks = await this.prisma.$queryRaw `
        SELECT c.id, c.content, c.chunk_index, d.file_name,
               1 - (c.embedding <=> ${vectorString}::vector) as similarity
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.org_id = ${orgId} AND d.expediente_id = ${expedienteId}
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT 5;
      `;
        }
        else {
            relevantChunks = await this.prisma.$queryRaw `
        SELECT c.id, c.content, c.chunk_index, d.file_name,
               1 - (c.embedding <=> ${vectorString}::vector) as similarity
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.org_id = ${orgId}
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT 5;
      `;
        }
        if (!relevantChunks || relevantChunks.length === 0) {
            return { answer: 'No se encontró información relevante en los documentos analizados.', sources: [] };
        }
        const contextText = relevantChunks
            .map(c => `[Documento: ${c.file_name} | Relevancia: ${(c.similarity * 100).toFixed(2)}%]\n...${c.content}...`)
            .join('\n\n');
        const systemPrompt = `
      Eres un asistente legal avanzado especializado en el análisis documental de expedientes jurídicos.
      Tus respuestas deben ser profesionales, objetivas, exactas y fundamentadas EXCLUSIVAMENTE en la información de los fragmentos que se te proporcionan como CONTEXTO. 
      Si la información no está en el contexto, indica claramente que "No hay suficiente información en el expediente cargado para responder a tu consulta", no inventes datos. Si te preguntan algo fuera del contexto jurídico del documento, ignóralo cordialmente.
    `;
        const chatResponse = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `CONTEXTO DOCUMENTAL:\n${contextText}\n\nPREGUNTA DEL ABOGADO: ${query}` }
            ],
        });
        const answer = chatResponse.choices[0].message.content;
        await this.prisma.aiQuery.create({
            data: {
                orgId,
                expedienteId,
                userId,
                queryText: query,
                responseText: answer || 'Respuesta vacía generada',
                sources: relevantChunks.map(c => ({ id: c.id, fileName: c.file_name, similarity: c.similarity }))
            }
        });
        return {
            answer,
            sources: relevantChunks.map(c => ({ fileName: c.file_name, snippet: c.content.substring(0, 50) + '...', similarity: c.similarity }))
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map