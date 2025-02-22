import KeyvMongo from '@keyv/mongo';
import KeyvMysql from '@keyv/mysql';
import KeyvPostgres from '@keyv/postgres';
import KeyvRedis from '@keyv/redis';
import KeyvSqlite from '@keyv/sqlite';
import { Injectable, Logger } from '@nestjs/common';
import Keyv, { KeyvStoreAdapter } from 'keyv';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  storagesMap = new Map<string, Keyv>();

  constructor() {
    const uri = process.env[`STORAGE_URI`];
    if (!uri) {
      this.logger.warn(
        `STORAGE_URI is undefined, will use non persistant in memory storage`,
      );
    }

    let store: KeyvStoreAdapter | Map<any, any> | any = new Map<any, any>();
    if (uri != null) {
      switch (uri.split('://')[0]) {
        case 'mongodb':
          store = new KeyvMongo(uri);
          break;
        case 'mysql':
          store = new KeyvMysql(uri);
          break;
        case 'postgresql':
          store = new KeyvPostgres(uri);
          break;
        case 'redis':
          store = new KeyvRedis(uri);
          break;
        case 'sqlite':
          store = new KeyvSqlite(uri);
          break;
      }
    }

    Object.keys(StorageNamespace).forEach((namespace) => {
      const keyv = new Keyv({
        store,
        namespace,
      });
      keyv.on('error', (err) =>
        this.logger.error(`Connection Error for namespace ${namespace}`, err),
      );
      this.storagesMap.set(namespace, keyv);
    });
  }

  get(key: string, namespace: StorageNamespace): Promise<Buffer> {
    return this.storagesMap.get(namespace).get(key);
  }

  async has(key: string, namespace: StorageNamespace): Promise<boolean> {
    return !!(await this.storagesMap.get(namespace).get(key));
  }

  set(
    key: string,
    value: Buffer,
    namespace: StorageNamespace,
  ): Promise<boolean> {
    return this.storagesMap.get(namespace).set(key, value);
  }
}

export enum StorageNamespace {
  SCENES = 'SCENES',
  ROOMS = 'ROOMS',
  FILES = 'FILES',
}
