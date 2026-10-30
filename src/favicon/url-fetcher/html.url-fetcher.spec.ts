import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

import { HtmlUrlFetcher } from './html.url-fetcher';

describe('HtmlUrlFetcher', () => {
  let server: Server;
  let baseUrl: string;
  let bytesSentForLastRequest: number;

  const hugeBody = `<body>${'<img src="data:image/webp;base64,AAAA">'.repeat(500_000)}</body>`;

  beforeAll(async () => {
    server = createServer((request, response) => {
      const html =
        request.url === '/no-head-end'
          ? `<html><link rel="icon" href="/icon.png">${hugeBody}</html>`
          : `<html><head><link rel="icon" href="/icon.png"></head>${hugeBody}</html>`;

      bytesSentForLastRequest = 0;
      response.writeHead(200, { 'Content-Type': 'text/html' });

      const chunkSize = 64 * 1024;
      let offset = 0;
      const writeNextChunk = () => {
        while (offset < html.length) {
          const chunk = html.slice(offset, offset + chunkSize);
          offset += chunkSize;
          bytesSentForLastRequest += chunk.length;
          if (!response.write(chunk)) {
            response.once('drain', writeNextChunk);
            return;
          }
        }
        response.end();
      };
      response.on('close', () => (offset = html.length));
      writeNextChunk();
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.closeAllConnections();
    server.close();
  });

  it('finds favicons in the head without downloading a huge body', async () => {
    const faviconUrls = await new HtmlUrlFetcher().fetchFaviconUrls(baseUrl);

    expect(faviconUrls).toEqual([
      `${baseUrl}/icon.png`,
      `${baseUrl}/favicon.ico`,
    ]);
    expect(hugeBody.length).toBeGreaterThan(10_000_000);
    expect(bytesSentForLastRequest).toBeLessThan(2_000_000);
  });

  it('stops reading a page without a closing head tag at the size cap', async () => {
    const faviconUrls = await new HtmlUrlFetcher().fetchFaviconUrls(
      `${baseUrl}/no-head-end`,
    );

    expect(faviconUrls).toEqual([
      `${baseUrl}/icon.png`,
      `${baseUrl}/favicon.ico`,
    ]);
    expect(bytesSentForLastRequest).toBeLessThan(8_000_000);
  });
});
