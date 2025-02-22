import { Test, TestingModule } from '@nestjs/testing';

import { StorageNamespace, StorageService } from '../storage/storage.service';
import { FilesController } from './files.controller';

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

    const dummyReq = {
      raw: {},
    };
    dummyReq.raw['rawBody'] = Buffer.from('test');

    const result = await controller.create('test', dummyReq as never);
    expect(setSpy).toHaveBeenCalledWith(
      'test',
      Buffer.from('test'),
      StorageNamespace.FILES,
    );
    expect(result).toEqual({ id: 'test' });
  });
});
