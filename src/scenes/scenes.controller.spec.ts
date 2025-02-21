import { Test, TestingModule } from '@nestjs/testing';
import { ScenesController } from './scenes.controller';
import { StorageService } from '../storage/storage.service';

describe('ScenesController', () => {
  let controller: ScenesController;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenesController],
      providers: [StorageService],
    }).compile();

    controller = module.get<ScenesController>(ScenesController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
