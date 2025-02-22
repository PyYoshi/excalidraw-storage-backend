import { Test, TestingModule } from '@nestjs/testing';

import { StorageService } from '../storage/storage.service';
import { RoomsController } from './rooms.controller';

describe('RoomsController', () => {
  let controller: RoomsController;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [StorageService],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
