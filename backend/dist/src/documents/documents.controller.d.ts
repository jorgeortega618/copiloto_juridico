import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(orgId: string, user: any, expedienteId: string, file: Express.Multer.File, title?: string): Promise<{
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
}
