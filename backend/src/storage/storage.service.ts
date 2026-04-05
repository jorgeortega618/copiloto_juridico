import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName = process.env.MINIO_DEFAULT_BUCKET || 'copiloto-documents';

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: '127.0.0.1', // Inside docker this is usually minio, locally it's 127.0.0.1
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ROOT_USER || 'admin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'admin_secret_123',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (e: any) {
      console.warn('⚠️ Could not connect or create MinIO bucket on init. Make sure MinIO is running.', e?.message || e);
    }
  }

  async uploadFile(orgId: string, expedienteId: string, file: Express.Multer.File) {
    // Lazy check: Ensure bucket exists before attempting upload
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (e) {
      console.warn('Silent bucket check issue:', e);
    }

    const objectName = `${orgId}/${expedienteId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );
    
    return objectName;
  }

  async getPresignedUrl(objectName: string) {
    return this.minioClient.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60);
  }

  async getFileBuffer(objectName: string): Promise<Buffer> {
    const stream = await this.minioClient.getObject(this.bucketName, objectName);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(objectName: string) {
    await this.minioClient.removeObject(this.bucketName, objectName);
  }
}
