import { Injectable } from '@nestjs/common';
import { fromBuffer } from 'file-type';

import { FileStorageService } from 'src/packages/file-storage/file-storage.service';
import { Readable } from 'stream';

@Injectable()
export class FileService {
  constructor(private readonly fileStorage: FileStorageService) {}

  async storeFavicon({
    domainName,
    file,
    extension,
  }: {
    file: Buffer;
    domainName: string;
    extension: string;
  }) {
    const { mime } =
      extension === 'svg' ? { mime: 'svg' } : await fromBuffer(file);

    await this.fileStorage.write({
      file,
      name: `${domainName}.${extension}`,
      mimeType: mime,
      folder: 'favicon',
    });
  }

  fetchFavicon({
    domainName,
    extension,
  }: {
    domainName: string;
    extension: string;
  }): Promise<Readable> {
    return this.fileStorage.read({
      folderPath: 'favicon',
      filename: `${domainName}.${extension}`,
    });
  }
}
