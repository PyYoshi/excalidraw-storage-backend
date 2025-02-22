import { MiddlewareConsumer, Module } from '@nestjs/common';

import { FilesController } from './files/files.controller';
import { FastifyRawParserMiddleware } from './raw-parser.middleware';
import { RoomsController } from './rooms/rooms.controller';
import { ScenesController } from './scenes/scenes.controller';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [],
  controllers: [ScenesController, RoomsController, FilesController],
  providers: [StorageService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FastifyRawParserMiddleware).forRoutes('{*splat}');
  }
}
