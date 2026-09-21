import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

const FOLDERS = ['images', 'documents', 'misc'];

@Controller('upload')
export class UploadController {
  private readonly allowedMime: string[];

  constructor(
    private readonly s3: S3Service,
    config: ConfigService,
  ) {
    this.allowedMime = config
      .get<string>(
        'S3_ALLOWED_MIME',
        'image/jpeg,image/png,image/webp,application/pdf',
      )
      .split(',');
  }

  /** Authenticated (global JWT guard). Size limit: S3_MAX_FILE_MB, see S3Module. */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('folder') folder = 'misc',
  ): Promise<{ key: string; url: string }> {
    if (!file) throw new BadRequestException('file is required');
    if (!FOLDERS.includes(folder)) {
      throw new BadRequestException(
        `folder must be one of: ${FOLDERS.join(', ')}`,
      );
    }
    if (!this.allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(`${file.mimetype} is not allowed`);
    }
    const key = await this.s3.upload(file, folder);
    return { key, url: this.s3.url(key) };
  }
}
