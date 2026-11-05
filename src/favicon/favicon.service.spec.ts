import { FileService } from './file.service';
import { FaviconService } from './favicon.service';
import { Favicon } from './interfaces/favicon.interface';
import { GoogleFaviconUrlFetcher } from './url-fetcher/google-favicon.url-fetcher';
import { HtmlUrlFetcher } from './url-fetcher/html.url-fetcher';

type TestableFaviconService = {
  getFaviconFromSubDomain(domainName: string): Promise<Favicon[]>;
  getImageFromUrl(url: string): Promise<Favicon>;
};

describe('FaviconService', () => {
  it('keeps URLs from successful fetchers when another fetcher fails', async () => {
    const faviconUrl = 'https://example.com/favicon.ico';
    const htmlUrlFetcher = {
      fetchFaviconUrls: jest.fn().mockResolvedValue([faviconUrl]),
    } as unknown as HtmlUrlFetcher;
    const googleFaviconUrlFetcher = {
      fetchFaviconUrls: jest.fn().mockRejectedValue(new Error('not found')),
    } as unknown as GoogleFaviconUrlFetcher;
    const service = new FaviconService(
      {} as FileService,
      htmlUrlFetcher,
      googleFaviconUrlFetcher,
    );
    const testableService = service as unknown as TestableFaviconService;
    const getImageFromUrl = jest
      .spyOn(testableService, 'getImageFromUrl')
      .mockResolvedValue({
        url: faviconUrl,
        file: Buffer.alloc(0),
        width: 0,
        height: 0,
        format: 'png',
      });

    await expect(
      testableService.getFaviconFromSubDomain('https://example.com'),
    ).resolves.toEqual([]);
    expect(getImageFromUrl).toHaveBeenCalledWith(faviconUrl);
  });
});
