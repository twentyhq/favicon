import axios from 'axios';

import { UrlFetcher } from './interfaces/url-fetcher.interface';

export class GoogleFaviconUrlFetcher implements UrlFetcher {
  async fetchFaviconUrls(subDomainName: string): Promise<string[]> {
    const response = await axios.get(
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${subDomainName}&size=64`,
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
    return [response.headers['content-location']];
  }
}
