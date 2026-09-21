import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

/**
 * Object storage on any S3-compatible endpoint (path-style). Optional: without
 * the S3_* vars every call throws 503.
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET_NAME', '');
    this.endpoint = config.get<string>('S3_ENDPOINT', '');
    const accessKeyId = config.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = config.get<string>('S3_SECRET_KEY');
    if (this.bucket && this.endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'default',
        endpoint: this.endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });
    } else {
      this.logger.warn('S3 disabled: S3_* not set');
    }
  }

  private get s3(): S3Client {
    if (!this.client)
      throw new ServiceUnavailableException('S3 not configured');
    return this.client;
  }

  /** Uploads under `<folder>/<uuid><ext>` and returns the object key. */
  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${randomUUID()}${extname(file.originalname)}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return key;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  url(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
