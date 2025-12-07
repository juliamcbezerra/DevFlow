import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const { BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET_NAME } = process.env;
    
    if (!BUCKET_REGION || !AWS_ACCESS_KEY || !AWS_SECRET_KEY || !BUCKET_NAME) {
      throw new Error('Faltam variáveis de ambiente para configuração do S3');
    }

    this.s3Client = new S3Client({
      region: BUCKET_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });

    this.bucketName = BUCKET_NAME;
  }

  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  // Helper para extrair a key da URL completa do S3
  extractKeyFromUrl(url: string): string {
    try {
      // Formato: https://bucket-name.s3.region.amazonaws.com/pasta/arquivo.jpg
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove a barra inicial
    } catch {
      // Se não conseguir fazer parse da URL, assume que é só a key
      return url;
    }
  }
}