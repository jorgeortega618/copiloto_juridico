import { OnModuleInit } from '@nestjs/common';
export declare class StorageService implements OnModuleInit {
    private minioClient;
    private bucketName;
    constructor();
    onModuleInit(): Promise<void>;
    uploadFile(orgId: string, expedienteId: string, file: Express.Multer.File): Promise<string>;
    getPresignedUrl(objectName: string): Promise<string>;
    getFileBuffer(objectName: string): Promise<Buffer>;
    deleteFile(objectName: string): Promise<void>;
}
