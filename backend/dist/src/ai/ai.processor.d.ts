import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
export declare class AiProcessor extends WorkerHost {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    process(job: Job<{
        documentId: string;
    }>): Promise<void>;
}
