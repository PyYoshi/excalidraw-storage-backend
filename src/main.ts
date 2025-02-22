import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  TransportMultiOptions,
  TransportPipelineOptions,
  TransportSingleOptions,
} from 'pino';

import { AppModule } from './app.module';

const isDebug = process.env.NODE_ENV !== 'production';

async function bootstrap() {
  let fastifyLoggerTransport:
    | TransportSingleOptions
    | TransportMultiOptions
    | TransportPipelineOptions
    | undefined;
  if (isDebug) {
    fastifyLoggerTransport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    };
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        name: 'backend',
        level: isDebug ? 'debug' : 'info',
        transport: fastifyLoggerTransport,
      },
    }),
    {
      cors: true,
      // logger: [logLevel],
      logger: new ConsoleLogger({
        logLevels: [isDebug ? 'debug' : 'log'],
        json: !isDebug,
      }),
    },
  );

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX ?? '/api/v2');

  const config = new DocumentBuilder()
    .setTitle('excalidraw-storage-backend')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('oai', app, documentFactory);

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
bootstrap();
