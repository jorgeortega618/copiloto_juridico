import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

@Processor('ai-processing')
@Injectable()
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
    });
  }

  async process(job: Job<{ documentId: string }>) {
    const { documentId } = job.data;
    this.logger.log(`🧠 Starting Chunking & Vectorization for document ${documentId}`);

    try {
      // 1. Get Extracted Text
      const textRecord = await this.prisma.documentText.findUnique({
        where: { documentId }
      });

      if (!textRecord || !textRecord.rawText) {
        throw new Error('No extracted text found for this document');
      }

      // 2. Chunking strategy
      // 1000 characters per chunk, 200 overlap is standard for general RAG
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([textRecord.rawText]);
      this.logger.log(`📄 Split document into ${docs.length} chunks`);

      // 3. Generate Embeddings (batch request if small enough, but let's do sequentially or small batches for safety)
      const embeddingsResponse = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002', // Standard model for pgvector 1536 dims
        input: docs.map(d => d.pageContent),
      });

      // 4. Save into pgvector via raw query
      for (let i = 0; i < embeddingsResponse.data.length; i++) {
        const embedding = embeddingsResponse.data[i].embedding;
        const pageContent = docs[i].pageContent;
        const chunkId = uuidv4();

        // Postgres vector array syntax: '[0.1, 0.2, ...]'
        const vectorString = `[${embedding.join(',')}]`;

        await this.prisma.$executeRaw`
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
    } catch (error: any) {
      this.logger.error(`❌ Failed AI Processing for document ${documentId}: ${error?.message || error}`);
      throw error;
    }
  }
}
