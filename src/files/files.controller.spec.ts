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

  it('should call storageService.get', async () => {
    const getSpy = jest
      .spyOn(storageService, 'get')
      .mockResolvedValue(Buffer.from('test'));
    const res = {
      pipe: jest.fn(),
    } as any;
    await controller.findOne('test', res);
    expect(getSpy).toHaveBeenCalledWith('test', StorageNamespace.FILES);
  });

  it('should call storageService.set', async () => {
    const setSpy = jest.spyOn(storageService, 'set').mockResolvedValue(true);
    const result = await controller.create('test', Buffer.from('test'));
    expect(setSpy).toHaveBeenCalledWith(
      'test',
      Buffer.from('test'),
      StorageNamespace.FILES,
    );
    expect(result).toEqual({ id: 'test' });
  });
});
