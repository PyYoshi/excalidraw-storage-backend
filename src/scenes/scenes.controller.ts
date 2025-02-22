import {
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { StorageNamespace, StorageService } from '../storage/storage.service';
import { Readable } from 'stream';
import { importEsmPackage } from '../import-esm-package';

// const nanoid =
// import { customAlphabet } from 'nanoid';

@Controller('scenes')
export class ScenesController {
  private readonly logger = new Logger(ScenesController.name);

  namespace = StorageNamespace.SCENES;

  constructor(private storageService: StorageService) {}

  @Get(':id')
  @Header('content-type', 'application/octet-stream')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const data = await this.storageService.get(id, this.namespace);
    this.logger.debug(`Get scene ${id}`);

    if (!data) {
      throw new NotFoundException();
    }

    const stream = new Readable();
    stream.push(data);
    stream.push(null);
    stream.pipe(res);
  }

  @Post()
  async create(@Body() payload: Buffer) {
    const { customAlphabet } =
      await importEsmPackage<typeof import('nanoid')>('nanoid');

    // Excalidraw front-end only support numeric id, we can't use nanoid default alphabet
    const nanoid = customAlphabet('0123456789', 16);
    const id = nanoid();

    // Check for collision
    if (await this.storageService.get(id, this.namespace)) {
      throw new InternalServerErrorException();
    }

    await this.storageService.set(id, payload, this.namespace);
    this.logger.debug(`Created scene ${id}`);

    return {
      id,
    };
  }
}
