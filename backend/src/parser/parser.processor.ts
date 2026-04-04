import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
const pdfParse = require('pdf-parse');

@Processor('document-parsing')
@Injectable()
export class ParserProcessor extends WorkerHost {
  private readonly logger = new Logger(ParserProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue('ai-processing') private readonly aiQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ documentId: string }>) {
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

      // 1. Fetch file from MinIO
      const buffer = await this.storage.getFileBuffer(doc.minioKey);

      // 2. Extract Text via PDF-Parse (MVP)
      // Note: for production, Tesseract or AWS Textract is recommended for image-pdfs
      let rawText = '';
      if (doc.minioKey.toLowerCase().endsWith('.pdf')) {
        const data = await pdfParse(buffer);
        rawText = data.text;
      } else {
        // Fallback for simple txt or let user know
        rawText = buffer.toString('utf-8');
      }

      // 3. Save Text into DocumentText (Upsert just in case)
      await this.prisma.documentText.upsert({
        where: { documentId },
        update: { rawText },
        create: {
          documentId,
          rawText
        }
      });

      // 4. Update parent document status
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' }
      });

      // 5. Trigger Ai Chunking Process
      await this.aiQueue.add('generate-embeddings', { documentId });

      this.logger.log(`✅ Completed parsing for document ${documentId}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed parsing document ${documentId}: ${error?.message || error}`);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'ERROR' }
      });
      throw error;
    }
  }
}
