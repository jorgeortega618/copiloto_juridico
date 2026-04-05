import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storageService;
    private readonly parsingQueue;
    constructor(prisma: PrismaService, storageService: StorageService, parsingQueue: Queue);
    uploadDocument(orgId: string, expedienteId: string, userId: string, file: Express.Multer.File, title?: string): Promise<{
        id: string;
        orgId: string;
        status: string;
        createdAt: Date;
        fileName: string;
        minioKey: string;
        expedienteId: string;
        uploadedById: string;
    }>;
    getDocumentUrl(orgId: string, id: string): Promise<{
        url: string;
        id: string;
        orgId: string;
        status: string;
        createdAt: Date;
        fileName: string;
        minioKey: string;
        expedienteId: string;
        uploadedById: string;
    }>;
    findAllByExpediente(orgId: string, expedienteId: string): Promise<{
        id: string;
        orgId: string;
        status: string;
        createdAt: Date;
        fileName: string;
        minioKey: string;
        expedienteId: string;
        uploadedById: string;
    }[]>;
}
