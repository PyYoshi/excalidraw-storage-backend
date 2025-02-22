import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

function isLogLevel(value: any): value is LogLevel {
  return value in ['log', 'error', 'warn', 'debug', 'verbose'];
}

async function bootstrap() {
  const logLevel = isLogLevel(process.env.LOG_LEVEL)
    ? process.env.LOG_LEVEL
    : 'log';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: true,
      logger: [logLevel],
    },
  );

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX ?? '/api/v2');

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('oai', app, documentFactory);

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
bootstrap();
