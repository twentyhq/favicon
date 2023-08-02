import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { FileService } from './file.service';
import { Readable } from 'stream';
import * as sharp from 'sharp';
import { assert } from 'src/utils/assert';

@Injectable()
export class FaviconService {
  constructor(private readonly fileService: FileService) {}

  async fetchFavicon(
    domainName: string,
  ): Promise<{ extension: string; file: Readable } | null> {
    const pngFavicon = await this.fileService.fetchFavicon({
      domainName,
      extension: 'png',
    });
    if (pngFavicon) {
      return { file: pngFavicon, extension: 'png' };
    }

    const svgFavicon = await this.fileService.fetchFavicon({
      domainName,
      extension: 'svg',
    });
    if (svgFavicon) {
      return { file: svgFavicon, extension: 'svg' };
    }

    const gifFavicon = await this.fileService.fetchFavicon({
      domainName,
      extension: 'gif',
    });
    if (gifFavicon) {
      return { file: gifFavicon, extension: 'svg' };
    }

    const icoFavicon = await this.fileService.fetchFavicon({
      domainName,
      extension: 'ico',
    });
    if (icoFavicon) {
      return { file: icoFavicon, extension: 'ico' };
    }
    return null;
  }

  async storeFavicon(domainName: string) {
    const url = `https://${domainName}`;

    let favicon;

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
    const response = await axios
      .get(subDomainName, {
        timeout: 5000,
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'user-agent':
            'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        },
      })
      .catch(() => null);

    let faviconUrls = [];
    if (response) {
      const html = response.data;
      const redirectedUrl = response.request.res.responseUrl;
      const baseRedirectedUrl =
        new URL(redirectedUrl).protocol + '//' + new URL(redirectedUrl).host;

      const faviconUrlsFromHtml = this._getFaviconUrlsFromHtml(
        html,
        baseRedirectedUrl,
      );
      faviconUrls = [
        ...faviconUrlsFromHtml,
        `${baseRedirectedUrl}/favicon.ico`,
      ];
    }

    const faviconUrlsFromGoogleFavicon =
      await this._getFaviconUrlFromGoogleFavicon(subDomainName).catch(
        () => null,
      );

    if (faviconUrlsFromGoogleFavicon) {
      faviconUrls.push(faviconUrlsFromGoogleFavicon);
    }

    console.log(faviconUrls);

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

  _getFaviconUrlsFromHtml(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const faviconUrls = [];
    $('link[rel=icon], link[rel="shortcut icon"]').each((i, icon) => {
      const href = $(icon).attr('href');
      faviconUrls.push(this._makeAbsoluteUrl(href, baseUrl));
    });

    $('meta[itemprop="image"]').each((i, icon) => {
      const href = $(icon).attr('content');
      faviconUrls.push(this._makeAbsoluteUrl(href, baseUrl));
    });

    return faviconUrls;
  }

  async _getFaviconUrlFromGoogleFavicon(
    domainName: string,
  ): Promise<string | null> {
    const response = await axios.get(
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domainName}&size=64`,
      {
        headers: {
          Cookie: '',
          Connection: 'keep-alive',
          'user-agent':
            'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        },
        responseType: 'arraybuffer',
      },
    );
    return response.headers['content-location'];
  }

  _makeAbsoluteUrl(url: string, baseUrl: string): string {
    const trimmedBaseUrl = baseUrl.replace(/\/$/, '');
    const absolutePattern = /^https?:\/\//i;
    if (absolutePattern.test(url)) {
      return url;
    } else if (url.startsWith('//')) {
      return `https:${url}`;
    } else if (url.startsWith('/')) {
      return `${trimmedBaseUrl}${url}`;
    } else {
      return `${trimmedBaseUrl}/${url}`;
    }
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
