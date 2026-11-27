import axios from 'axios';
import sharp from 'sharp';

import { FaviconService } from './favicon.service';
import { FileService } from './file.service';
import { HtmlUrlFetcher } from './url-fetcher/html.url-fetcher';
import { GoogleFaviconUrlFetcher } from './url-fetcher/google-favicon.url-fetcher';

describe('FaviconService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('stores favicons as soon as their downloads resolve', async () => {
    const png = await sharp({
      create: { width: 64, height: 64, channels: 4, background: '#f00' },
    })
      .png()
      .toBuffer();
    jest.spyOn(axios, 'get').mockResolvedValue({ data: png });
    const storeFavicon = jest.fn();
    const service = new FaviconService(
      { storeFavicon } as unknown as FileService,
      {
        fetchFaviconUrls: async () => [
          'https://example.com/icon.png',
          'https://example.com/favicon.ico',
        ],
      } as unknown as HtmlUrlFetcher,
      {
        fetchFaviconUrls: async () => ['https://t2.gstatic.com/favicon.png'],
      } as unknown as GoogleFaviconUrlFetcher,
    );

    const start = Date.now();
    await service.storeFavicon('example.com');

    expect(Date.now() - start).toBeLessThan(1000);
    expect(storeFavicon).toHaveBeenCalled();
  });
});
