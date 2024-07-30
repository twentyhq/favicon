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

  static getSmallestFaviconLargerThanSize(
    faviconFiles: Array<Favicon>,
    size: number,
  ): Favicon | null {
    const smallest = faviconFiles.reduce((smallest, current) => {
      // If the current favicon is larger than the desired size and either we
      // don't have a smallest favicon yet or the current one is smaller than
      // the smallest one we've found so far
      return current.width >= size &&
        (!smallest || current.width < smallest.width)
        ? current
        : smallest;
    }, null);

    return (
      smallest ?? ImageManipulation.getLargestFaviconFile(faviconFiles, size)
    );
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

  static isSVGFile(buffer: Buffer): boolean {
    const svgTag = '<svg';
    const bufferAsString = buffer.toString(
      'utf-8',
      0,
      Math.min(buffer.length, 100),
    );
    return bufferAsString.includes(svgTag);
  }

  static isPNGFile(buffer: Buffer): boolean {
    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    return buffer.subarray(0, 8).equals(pngSignature);
  }

  static isAlmostSquare(favicon: Favicon): boolean {
    if (favicon.height === 0 || favicon.width === 0) {
      return false;
    }
    return (
      favicon.width / favicon.height > 0.9 &&
      favicon.width / favicon.height < 1.1
    );
  }
}
