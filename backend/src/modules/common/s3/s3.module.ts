import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { UploadController } from './upload.controller';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limits: {
          fileSize: config.get<number>('S3_MAX_FILE_MB', 10) * 1024 * 1024,
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
