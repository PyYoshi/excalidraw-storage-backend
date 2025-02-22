import {
  BadRequestException,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Readable } from 'stream';

import { importEsmPackage } from '../import-esm-package';
import { StorageNamespace, StorageService } from '../storage/storage.service';

@Controller('scenes')
export class ScenesController {
  private readonly logger = new Logger(ScenesController.name);

  namespace = StorageNamespace.SCENES;

  constructor(private storageService: StorageService) {}

  @Get(':id')
  @Header('content-type', 'application/octet-stream')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const data = await this.storageService.get(id, this.namespace);
    this.logger.debug(`Get scene ${id}`);

    if (!data) {
      throw new NotFoundException();
    }

    const stream = new Readable();
    stream.push(data);
    stream.push(null);
    stream.pipe(res.raw);
  }

  @Post()
  async create(@Req() req: FastifyRequest) {
    if (!('rawBody' in req.raw)) {
      throw new BadRequestException('Missing body');
    }

    if (!Buffer.isBuffer(req.raw['rawBody'])) {
      throw new BadRequestException('Invalid body');
    }

    const { customAlphabet } =
      await importEsmPackage<typeof import('nanoid')>('nanoid');

    // Excalidraw front-end only support numeric id, we can't use nanoid default alphabet
    const nanoid = customAlphabet('0123456789', 16);
    const id = nanoid();

    // Check for collision
    if (await this.storageService.get(id, this.namespace)) {
      throw new InternalServerErrorException();
    }

    await this.storageService.set(id, req.raw['rawBody'], this.namespace);
    this.logger.debug(`Created scene ${id}`);

    return {
      id,
    };
  }
}
