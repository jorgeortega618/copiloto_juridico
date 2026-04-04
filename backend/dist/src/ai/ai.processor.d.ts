import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class AiProcessor extends WorkerHost {
    private readonly prisma;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService);
    process(job: Job<{
        documentId: string;
    }>): Promise<void>;
}
