import * as fs from 'fs/promises';
import { PathLike, createReadStream, existsSync, readdir, stat } from 'fs';
import { join, dirname } from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';

import { StorageDriver } from './interfaces/storage-driver.interface';

const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);

export interface LocalDriverOptions {
  storagePath: string;
}

export class LocalDriver implements StorageDriver {
  private options: LocalDriverOptions;

  constructor(options: LocalDriverOptions) {
    this.options = options;
  }

  async createFolder(path: string) {
    if (existsSync(path)) {
      return;
    }

    return fs.mkdir(path, { recursive: true });
  }

  async write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
  }): Promise<void> {
    const filePath = join(
      `${this.options.storagePath}/`,
      params.folder,
      params.name,
    );
    const folderPath = dirname(filePath);

    await this.createFolder(folderPath);

    await fs.writeFile(filePath, params.file);
  }

  async read(params: {
    folderPath: string;
    filename: string;
  }): Promise<Readable> {
    const filePath = join(
      `${this.options.storagePath}/`,
      params.folderPath,
      params.filename,
    );

    if (!existsSync(filePath)) {
      return;
    }

    return createReadStream(filePath);
  }

  async getDomains(path: PathLike) {
    const dirents = await readdirAsync(path, { withFileTypes: true });
    const domainStats = await Promise.all(
      dirents.map(async (dirent) => {
        const { name, path: domainPath } = dirent;
        const changedAt = (await statAsync(join(domainPath, name))).ctime;
        return { name, changedAt };
      }),
    );
    return domainStats;
  }

  async listFiles(chunkSize: number, olderThan: Date) {
    const path = join(`${this.options.storagePath}`, 'favicon');
    // We cannot actually chunk reads to a local directory
    const allDomains = await this.getDomains(path);
    const filteredDomains = allDomains.filter(
      ({ changedAt }) => changedAt < olderThan,
    );

    return filteredDomains.slice(0, chunkSize).map(({ name }) => name);
  }
}
