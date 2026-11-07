import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createHttpLoggerMiddleware } from './modules/common/middleware/http-logger.middleware';
import { isProduction } from './modules/common/utils/is-production';
import { mountFrontend } from './modules/common/web/mount-frontend';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Main');

  // CORS_ORIGIN: comma-separated allow-list; unset allows every origin.
  const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: origins ? { origin: origins } : true,
  });
  // CSP off outside production so the Swagger UI's inline scripts still load.
  app.use(helmet({ contentSecurityPolicy: isProduction() }));
  app.set('trust proxy', 1);
  app.use(compression());
  if (process.env.NODE_ENV !== 'test') app.use(createHttpLoggerMiddleware());
  app.enableShutdownHooks();

  // The response interceptor, exception filter and validation pipes are declared
  // in AppModule so the test harness runs the same stack this bootstrap does.

  // The whole API lives under /api; everything else is the frontend (mountFrontend).
  app.setGlobalPrefix('api');
  await mountFrontend(app);

  if (!isProduction()) {
    const config = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();

    SwaggerModule.setup(
      'api-doc',
      app,
      SwaggerModule.createDocument(app, config),
      {
        swaggerOptions: { persistAuthorization: true },
      },
    );
  }

  await app.init();

  const port = +app.get(ConfigService).getOrThrow<string>('PORT');
  await app.listen(port);
  logger.log(`App running on ${await app.getUrl()}`);
}

bootstrap().catch((err) => console.error(err));
