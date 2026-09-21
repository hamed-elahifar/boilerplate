import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';
import { createHttpLoggerMiddleware } from './modules/common/middleware/http-logger.middleware';
import { isProduction } from './modules/common/utils/is-production';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // Enable CORS for all origins
  });
  app.set('trust proxy', 1);
  app.use(compression());
  if (process.env.NODE_ENV !== 'test') app.use(createHttpLoggerMiddleware());
  app.enableShutdownHooks();

  // The response interceptor, exception filter and validation pipes are declared
  // in AppModule so the test harness runs the same stack this bootstrap does.

  if (!isProduction()) {
    // The built frontend calls the API under /api (its dev proxy strips it); do the same here.
    app.use((req: { url: string }, _res: unknown, next: () => void) => {
      req.url = req.url.replace(/^\/api(?=\/|$)/, '');
      next();
    });

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
