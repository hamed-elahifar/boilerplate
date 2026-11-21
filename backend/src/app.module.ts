import { Module, ValidationPipe } from '@nestjs/common';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './modules/common/validators/env.validation.js';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './modules/auth/guards/roles.guard.js';
import { LoggerModule } from './modules/common/logger/logger.module.js';
import { CustomLogger } from './modules/common/logger/logger.service.js';
import { GlobalExceptionFilter } from './modules/common/filters/index.js';
import { ResponseInterceptor } from './modules/common/interceptors/index.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Redis } from 'ioredis';
import { TelegramModule } from './modules/common/telegram/telegram.module.js';
import {
  REDIS_CLIENT,
  RedisModule,
} from './modules/common/redis/redis.module.js';
import { S3Module } from './modules/common/s3/s3.module.js';
import { SmsModule } from './modules/common/sms/sms.module.js';
import { PushModule } from './modules/common/push/push.module.js';
import { BodyLanguageResolver } from './modules/common/utils/body-language.resolver.js';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  I18nValidationPipe,
  QueryResolver,
} from 'nestjs-i18n';
import { HealthController } from './modules/common/health/health.controller.js';
import { isProduction } from './modules/common/utils/is-production.js';
import { UsersModule } from './modules/users/users.module.js';

const validationOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: false,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URL'),
      }),
    }),
    // Language per request: `?lang=en`, else x-lang header, else body `language`, else Accept-Language, else DEFAULT_LANGUAGE.
    // Resources live in src/i18n/<lang>/*.json.
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        fallbackLanguage: config.get<string>('DEFAULT_LANGUAGE', 'fa'),
        loaderOptions: {
          path: join(dirname(fileURLToPath(import.meta.url)), '/i18n/'),
          watch: !isProduction(),
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-lang']),
        new BodyLanguageResolver(),
        AcceptLanguageResolver,
      ],
    }),
    // Optional integrations (each no-ops or stays off when its env vars are unset).
    TelegramModule,
    RedisModule,
    S3Module,
    SmsModule,
    PushModule,
    // 100 req/min per IP; in-memory, or shared through Redis when REDIS_URL is set.
    ThrottlerModule.forRootAsync({
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis | null) => ({
        throttlers: [{ ttl: 60_000, limit: 100 }],
        skipIf: () => process.env.NODE_ENV === 'test',
        ...(redis && { storage: new ThrottlerStorageRedisService(redis) }),
      }),
    }),
    AuthModule,
    LoggerModule,
    UsersModule,
  ],
  controllers: [HealthController],
  // Every cross-cutting concern is registered here rather than during bootstrap,
  // so the test harness exercises the same stack the running application does.
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Declaration order is application order: the i18n pipe validates first, so
    // its translated messages are the ones that surface, and the plain pipe runs
    // after it.
    { provide: APP_PIPE, useValue: new I18nValidationPipe(validationOptions) },
    { provide: APP_PIPE, useValue: new ValidationPipe(validationOptions) },
    CustomLogger,
  ],
})
export class AppModule {}
