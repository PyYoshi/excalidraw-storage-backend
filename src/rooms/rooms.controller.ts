import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Logger,
  NotFoundException,
  Param,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Readable } from 'stream';

import { StorageNamespace, StorageService } from '../storage/storage.service';

@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  namespace = StorageNamespace.ROOMS;

  constructor(private storageService: StorageService) {}

  @Get(':id')
  @Header('content-type', 'application/octet-stream')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const data = await this.storageService.get(id, this.namespace);
    this.logger.debug(`Get room ${id}`);

    if (!data) {
      throw new NotFoundException();
    }

    const stream = new Readable();
    stream.push(data);
    stream.push(null);
    stream.pipe(res.raw);
  }

  @Put(':id')
  async create(@Param('id') id: string, @Req() req: FastifyRequest) {
    if (!('rawBody' in req.raw)) {
      throw new BadRequestException('Missing body');
    }

    // req.raw['rawBody'] is a Buffer
    if (!Buffer.isBuffer(req.raw['rawBody'])) {
      throw new BadRequestException('Invalid body');
    }

    await this.storageService.set(id, req.raw['rawBody'], this.namespace);
    this.logger.debug(`Created room ${id}`);

    return {
      id,
    };
  }
}
