import { Injectable } from '@nestjs/common';

import { FileStorageService } from 'src/packages/file-storage/file-storage.service';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  constructor(private readonly fileStorage: FileStorageService) {}

  async storeFavicon({
    domainName,
    file,
    size,
  }: {
    file: Buffer;
    domainName: string;
    size: string;
  }) {
    await this.fileStorage.write({
      file,
      name: `${size}.png`,
      mimeType: 'image/png',
      folder: `favicon/${domainName}`,
    });
  }

  fetchFavicon({
    domainName,
    size,
  }: {
    domainName: string;
    size: string;
  }): Promise<Readable> {
    return this.fileStorage.read({
      folderPath: `favicon/${domainName}`,
      filename: `${size}.png`,
    });
  }

  async listFiles(chunkSize: number, olderThan: Date) {
    return this.fileStorage.listFiles(chunkSize, olderThan);
  }
}
