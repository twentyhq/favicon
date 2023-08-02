import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FileService } from './file.service';
import { Readable } from 'stream';
import * as sharp from 'sharp';
import { assert } from 'src/utils/assert';
import { HtmlFetchStrategy } from './fetch-strategies/html.fetch-strategy';
import { GoogleFaviconFetchStrategy } from './fetch-strategies/google-favicon.fetch-strategy';
import { FetchStrategy } from './fetch-strategies/interfaces/fetch-strategy.interface';

const SUPPORTED_EXTENSIONS = ['png', 'svg', 'gif', 'ico']
@Injectable()
export class FaviconService {
  constructor(
    private readonly fileService: FileService,
    private readonly htmlFetchStrategy: HtmlFetchStrategy,
    private readonly googleFaviconFetchStrategy: GoogleFaviconFetchStrategy
  ) {}

  async fetchFaviconFromStorage(
    domainName: string,
  ): Promise<{ file: Readable, extension: string } | null> {
    for (const extension of SUPPORTED_EXTENSIONS) {
      const favicon = await this.fileService.fetchFavicon({
        domainName,
        extension,
      });
      if (favicon) {
        return { file: favicon, extension };
      }
    }
  }

  async storeFavicon(domainName: string) {
    const url = `https://${domainName}`;

    let favicon: { url: string; file: any; };

    favicon = await this._getFaviconFromSubDomain(url).catch(() => null);
    if (!favicon) {
      const alternativeUrl = `https://www.${domainName}`;
      favicon = await this._getFaviconFromSubDomain(alternativeUrl);
    }

    if (!favicon) {
      return;
    }

    const extension = this._getFileExtension(favicon.url);
    assert(extension, 'Extension could not be determined');

    await this.fileService.storeFavicon({
      domainName,
      file: favicon.file,
      extension: extension,
    });
  }

  async _getFaviconFromSubDomain(subDomainName: string) {
    let faviconUrls = [];
    const strategies: Array<FetchStrategy> =
      [
        this.htmlFetchStrategy,
        this.googleFaviconFetchStrategy
      ];

    for (const strategy of strategies) {
      const fetchedFaviconUrls = await strategy.fetchFaviconUrls(subDomainName);
      faviconUrls = [...faviconUrls, ...fetchedFaviconUrls];
    }

    const faviconFiles = [];
    const faviconFetchPromises = faviconUrls.map(
      (
        url,
      ): Promise<{
        file: Buffer;
        width: number;
        height: number;
        url: string;
      }> => {
        return this._getImageFromUrl(url).catch(() => null);
      },
    );

    for (const promise of faviconFetchPromises) {
      await new Promise((r) => setTimeout(r, 500));
      const faviconFile = await promise;
      faviconFiles.push(faviconFile);
    }

    const largerFaviconFile = faviconFiles
      .filter((faviconFile) => faviconFile !== null)
      .reduce(
        (prev, current) => {
          if (
            current.width > prev.width &&
            current.width === current.height &&
            current.width >= 32
          ) {
            return current;
          } else {
            return prev;
          }
        },
        { width: 0, height: 0, file: Buffer.from(''), url: '' },
      );

    if (largerFaviconFile.width === 0) {
      return;
    }

    return largerFaviconFile;
  }

  async _getImageFromUrl(
    url: string,
  ): Promise<{ file: Buffer; width: number; height: number; url: string }> {
    const response = await axios.get(url, {
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'user-agent':
          'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      },
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data, 'utf-8');

    const extension = this._getFileExtension(url);
    if (extension === 'svg') {
      return {
        url: url,
        file: buffer,
        width: 256,
        height: 256,
      };
    }

    if (extension === 'ico') {
      return {
        url: url,
        file: buffer,
        width: 32,
        height: 32,
      };
    }

    const bufferMetadata = await sharp(buffer).metadata();
    return {
      url: url,
      file: buffer,
      width: bufferMetadata.width,
      height: bufferMetadata.height,
    };
  }

  _getFileExtension(url: string): string {
    return url.split(/[#?]/)[0].split('.').pop().trim();
  }

  checkDomainIsValid(domainName: string) {
    const domainPattern =
      /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
    return domainPattern.test(domainName);
  }

  computeResponseContentType(extension: string) {
    switch (extension) {
      case 'svg':
        return 'image/svg+xml';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'ico':
        return 'image/x-icon';
      default:
        return 'image/png';
    }
  }
}
