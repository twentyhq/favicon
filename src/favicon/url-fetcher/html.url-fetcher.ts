import axios from 'axios';
import * as cheerio from 'cheerio';
import { Readable } from 'stream';

import { UrlFetcher } from './interfaces/url-fetcher.interface';
import { MAX_HTML_LENGTH } from '../favicon.constants';

export class HtmlUrlFetcher implements UrlFetcher {
  async fetchFaviconUrls(subDomainName: string): Promise<string[]> {
    const response = await axios
      .get<Readable>(subDomainName, {
        timeout: 5000,
        responseType: 'stream',
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'user-agent':
            'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        },
      })
      .catch(() => null);
    if (response) {
      const html = await this.readHtmlHead(response.data).catch(() => null);

      if (html === null) {
        return [];
      }

      const redirectedUrl = response.request.res.responseUrl;
      const baseRedirectedUrl =
        new URL(redirectedUrl).protocol + '//' + new URL(redirectedUrl).host;

      const faviconUrlsFromHtml = this.getFaviconUrlsFromHtml(
        html,
        baseRedirectedUrl,
      );

      return [...faviconUrlsFromHtml, `${baseRedirectedUrl}/favicon.ico`];
    }
    return [];
  }

  // Some pages inline megabytes of base64 assets and cheerio needs ~30x the
  // page size in heap, so only <link> and <meta> tags of the <head> are parsed.
  private async readHtmlHead(stream: Readable): Promise<string> {
    stream.setEncoding('utf8');

    let html = '';

    for await (const chunk of stream) {
      const searchFrom = Math.max(0, html.length - '</head>'.length);

      html += chunk;

      const headEndIndex = html.slice(searchFrom).search(/<\/head>/i);

      if (headEndIndex !== -1) {
        return html.slice(0, searchFrom + headEndIndex);
      }

      if (html.length >= MAX_HTML_LENGTH) {
        return html;
      }
    }

    return html;
  }

  private getFaviconUrlsFromHtml(html: string, baseUrl: string): string[] {
    const linkAndMetaTags = html.match(/<(link|meta)\b[^>]*>/gi) ?? [];
    const $ = cheerio.load(linkAndMetaTags.join(''));
    const faviconUrls = [];
    $(
      'link[rel=icon], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    ).each((i, icon) => {
      const href = $(icon).attr('href');
      faviconUrls.push(this.makeAbsoluteUrl(href, baseUrl));
    });

    $('meta[itemprop="image"]').each((i, icon) => {
      const href = $(icon).attr('content');
      faviconUrls.push(this.makeAbsoluteUrl(href, baseUrl));
    });

    return faviconUrls;
  }

  private makeAbsoluteUrl(url: string, baseUrl: string): string {
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
}
