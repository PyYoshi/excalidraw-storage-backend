import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { StorageNamespace, StorageService } from '../storage/storage.service';

describe('FilesController', () => {
  let controller: FilesController;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [StorageService],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
