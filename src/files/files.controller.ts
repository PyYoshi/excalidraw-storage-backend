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

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  namespace = StorageNamespace.FILES;

  constructor(private storageService: StorageService) {}

  @Get(':id')
  @Header('content-type', 'application/octet-stream')
  async findOne(
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const data = await this.storageService.get(id, this.namespace);
    this.logger.debug(`Get image ${id}`);

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

    if (!Buffer.isBuffer(req.raw['rawBody'])) {
      throw new BadRequestException('Invalid body');
    }

    await this.storageService.set(id, req.raw['rawBody'], this.namespace);
    this.logger.debug(`Created image ${id}`);

    return {
      id,
    };
  }
}
