import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EventsGateway } from '../events/events.gateway';
export declare class ParserProcessor extends WorkerHost {
    private readonly prisma;
    private readonly storage;
    private readonly eventsGateway;
    private readonly aiQueue;
    private readonly logger;
    constructor(prisma: PrismaService, storage: StorageService, eventsGateway: EventsGateway, aiQueue: Queue);
    process(job: Job<{
        documentId: string;
    }>): Promise<void>;
}
