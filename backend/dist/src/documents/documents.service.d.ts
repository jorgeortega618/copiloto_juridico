import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storageService;
    private readonly parsingQueue;
    private openai;
    constructor(prisma: PrismaService, storageService: StorageService, parsingQueue: Queue);
    uploadDocument(orgId: string, expedienteId: string, userId: string, file: Express.Multer.File, title?: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        status: string;
        expedienteId: string;
        fileName: string;
        minioKey: string;
        uploadedById: string;
    }>;
    getDocumentUrl(orgId: string, id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        orgId: string;
        status: string;
        expedienteId: string;
        fileName: string;
        minioKey: string;
        uploadedById: string;
    }>;
    findAllByExpediente(orgId: string, expedienteId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        status: string;
        expedienteId: string;
        fileName: string;
        minioKey: string;
        uploadedById: string;
    }[]>;
    remove(orgId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    aiRename(orgId: string, id: string): Promise<{
        previousName: string;
        id: string;
        createdAt: Date;
        orgId: string;
        status: string;
        expedienteId: string;
        fileName: string;
        minioKey: string;
        uploadedById: string;
    }>;
}
