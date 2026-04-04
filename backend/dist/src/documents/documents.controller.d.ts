import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(orgId: string, user: any, expedienteId: string, file: Express.Multer.File, title?: string): Promise<{
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
}
