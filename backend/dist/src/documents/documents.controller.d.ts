import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(orgId: string, user: any, expedienteId: string, file: Express.Multer.File, title?: string): Promise<{
        id: string;
        fileName: string;
        minioKey: string;
        status: string;
        createdAt: Date;
        orgId: string;
        expedienteId: string;
        uploadedById: string;
    }>;
    findAllByExpediente(orgId: string, expedienteId: string): Promise<{
        id: string;
        fileName: string;
        minioKey: string;
        status: string;
        createdAt: Date;
        orgId: string;
        expedienteId: string;
        uploadedById: string;
    }[]>;
    getDocumentUrl(orgId: string, id: string): Promise<{
        url: string;
        id: string;
        fileName: string;
        minioKey: string;
        status: string;
        createdAt: Date;
        orgId: string;
        expedienteId: string;
        uploadedById: string;
    }>;
    remove(orgId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    aiRename(orgId: string, id: string): Promise<{
        previousName: string;
        id: string;
        fileName: string;
        minioKey: string;
        status: string;
        createdAt: Date;
        orgId: string;
        expedienteId: string;
        uploadedById: string;
    }>;
}
