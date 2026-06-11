import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = process.env.BUCKET_NAME || 'copiloto-documents';

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.BUCKET_ENDPOINT,
      region: process.env.BUCKET_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY || '',
        secretAccessKey: process.env.BUCKET_SECRET_KEY || '',
      },
      forcePathStyle: true, // Required for S3-compatible services
    });
  }

  async uploadFile(orgId: string, expedienteId: string, file: Express.Multer.File) {
    const objectName = `${orgId}/${expedienteId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    
    return objectName;
  }

  async getPresignedUrl(objectName: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 24 * 60 * 60 });
  }

  async getFileBuffer(objectName: string): Promise<Buffer> {
    const response = await this.s3Client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
    }));
    
    const stream = response.Body as Readable;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(objectName: string) {
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: objectName,
    }));
  }
}
