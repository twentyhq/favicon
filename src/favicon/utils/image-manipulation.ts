import sharp from 'sharp';

import { Favicon } from '../interfaces/favicon.interface';

export class ImageManipulation {
  static getLargestFaviconFile(
    faviconFiles: Array<Favicon>,
    size: number,
  ): Favicon {
    const largestFaviconFile = faviconFiles.reduce((prev, current) => {
      return current.width > prev.width ? current : prev;
    });

    if (
      largestFaviconFile.format !== 'svg' &&
      largestFaviconFile.width < size
    ) {
      return null;
    }
    return largestFaviconFile;
  }

  static async convertFaviconFileToPngAndResize(
    faviconFile: Favicon,
    size: number,
  ): Promise<Favicon> {
    const convertedFile = await sharp(faviconFile.file)
      .resize(size)
      .png()
      .toBuffer();
    const convertedFileMetadata = await sharp(convertedFile).metadata();

    return {
      width: convertedFileMetadata.width,
      height: convertedFileMetadata.height,
      file: convertedFile,
      url: null,
      format: convertedFileMetadata.format,
    };
  }

  static isIcoFile(buffer: Buffer): boolean {
    const icoSignature = Buffer.from([0, 0, 1, 0]); // The first four bytes of ICO format
    return buffer.subarray(0, 4).equals(icoSignature);
  }
}
