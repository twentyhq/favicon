import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Readable } from 'stream';
import sharp from 'sharp';

import { FileService } from './file.service';
import { HtmlUrlFetcher } from './url-fetcher/html.url-fetcher';
import { GoogleFaviconUrlFetcher } from './url-fetcher/google-favicon.url-fetcher';
import { UrlFetcher } from './url-fetcher/interfaces/url-fetcher.interface';
import { SUPPORTED_SIZES } from './favicon.constants';
import { Favicon } from './interfaces/favicon.interface';
import { ImageManipulation } from './utils/image-manipulation';
import icoToPng from 'ico-to-png';

@Injectable()
export class FaviconService {
  constructor(
    private readonly fileService: FileService,
    private readonly htmlUrlFetcher: HtmlUrlFetcher,
    private readonly googleFaviconUrlFetcher: GoogleFaviconUrlFetcher,
  ) {}

  async fetchFaviconFromStorage(
    domainName: string,
    size: number,
  ): Promise<Readable> {
    const exactSizeFavicon = await this.fileService.fetchFavicon({
      domainName,
      size: size.toString(),
    });

    if (exactSizeFavicon) {
      return exactSizeFavicon;
    }

    for (const supportedSize of SUPPORTED_SIZES.sort((a, b) => b - a)) {
      if (supportedSize <= size) {
        const favicon = await this.fileService.fetchFavicon({
          domainName,
          size: supportedSize.toString(),
        });

        if (favicon) {
          return favicon;
        }
      }
    }
  }

  async storeFavicon(domainName: string) {
    const url = `https://${domainName}`;

    let faviconsFromSubDomain;

    faviconsFromSubDomain = await this.getFaviconFromSubDomain(url).catch(
      () => [],
    );

    if (faviconsFromSubDomain.length == 0) {
      const alternativeUrl = `https://www.${domainName}`;
      faviconsFromSubDomain = await this.getFaviconFromSubDomain(
        alternativeUrl,
      ).catch(() => []);
    }

    if (faviconsFromSubDomain.length == 0) {
      return;
    }
    for (const favicon of faviconsFromSubDomain) {
      await this.fileService.storeFavicon({
        domainName,
        file: favicon.file,
        size: favicon.width,
      });
    }
  }

  private async getFaviconFromSubDomain(domainName: string) {
    let faviconUrls: Array<string> = [];
    const strategies: Array<UrlFetcher> = [
      this.htmlUrlFetcher,
      this.googleFaviconUrlFetcher,
    ];

    for (const strategy of strategies) {
      const fetchedFaviconUrls = await strategy.fetchFaviconUrls(domainName);

      faviconUrls = [...faviconUrls, ...fetchedFaviconUrls];
    }

    const faviconFiles: Array<Favicon> = [];
    const faviconFetchPromises = faviconUrls.map((url): Promise<Favicon> => {
      return this.getImageFromUrl(url).catch((error) => {
        console.error(error);
        return null;
      });
    });

    for (const promise of faviconFetchPromises) {
      await new Promise((r) => setTimeout(r, 500));
      const faviconFile = await promise;
      faviconFiles.push(faviconFile);
    }

    const uniquefaviconFiles = this.uniqueFaviconFiles(faviconFiles);

    if (uniquefaviconFiles.length == 0) {
      return [];
    }

    const convertedFiles = [];

    for (const targetSize of SUPPORTED_SIZES) {
      const smallestLargerThanSize =
        ImageManipulation.getSmallestFaviconLargerThanSize(
          uniquefaviconFiles,
          targetSize,
        );
      if (
        smallestLargerThanSize == null ||
        smallestLargerThanSize.width === 0
      ) {
        continue;
      }
      const convertedFile =
        await ImageManipulation.convertFaviconFileToPngAndResize(
          smallestLargerThanSize,
          targetSize,
        );

      convertedFiles.push(convertedFile);
    }

    return convertedFiles;
  }

  private async getImageFromUrl(url: string): Promise<Favicon> {
    const response = await axios.get(url, {
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'user-agent':
          'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      },
      responseType: 'arraybuffer',
    });

    let buffer = Buffer.from(response.data, 'utf-8');
    if (
      ImageManipulation.isIcoFile(buffer) ||
      ImageManipulation.isSVGFile(buffer) ||
      ImageManipulation.isPNGFile(buffer)
    ) {
      try {
        buffer = await sharp(buffer)
          .resize({
            width: 128,
            height: 128,
            fit: sharp.fit.fill,
          })
          .toFormat('png')
          .toBuffer();
      } catch (error) {
        buffer = await icoToPng(buffer, 128);
      }
    }
    const bufferMetadata = await sharp(buffer).metadata();

    return {
      url: url,
      file: buffer,
      width: bufferMetadata.width,
      height: bufferMetadata.height,
      format: bufferMetadata.format,
    };
  }

  private uniqueFaviconFiles(faviconFiles: Array<Favicon>): Array<Favicon> {
    return [
      ...new Map(
        faviconFiles
          .filter(
            (faviconFile) =>
              faviconFile !== null &&
              faviconFile !== undefined &&
              ImageManipulation.isAlmostSquare(faviconFile),
          )
          .map((faviconFile) => [faviconFile.width, faviconFile]),
      ).values(),
    ];
  }
}
