import { Controller, Get, Param, Redirect, Res } from '@nestjs/common';
import { FaviconService } from './favicon.service';
import { Response } from 'express';
import { DEFAULT_SIZE, SUPPORTED_SIZES } from './favicon.constants';
import { Readable } from 'stream';

@Controller()
export class FaviconController {
  constructor(private readonly faviconService: FaviconService) {}

  @Get()
  @Redirect('https://github.com/twentyhq/favicon/blob/main/README.md', 301)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  redirectToReadme() {}

  @Get('/health')
  checkHealth(@Res() res: Response) {
    res.status(200).send();
  }

  @Get('/healthz')
  checkHealthz(@Res() res: Response) {
    res.status(200).send();
  }

  @Get('/favicon.ico')
  async getOwnFavicon() {
    return;
  }

  @Get(':domainName/:size?')
  async getFaviconWithSize(
    @Param() params: { domainName: string; size: string },
    @Res() res: Response,
  ) {
    const domainName = params.domainName;
    const size = params.size ?? DEFAULT_SIZE;
    if (!this.checkDomainIsValid(domainName)) {
      return res.status(400).send('Invalid domain');
    }
    if (!this.checkSizeIsValid(+size)) {
      return res.status(400).send('Invalid size');
    }
    const existingFavicon = await this.faviconService.fetchFaviconFromStorage(
      params.domainName,
      parseInt(size),
    );

    if (existingFavicon) {
      return this.returnWithComputedResponseContentType(res, existingFavicon);
    }

    await this.faviconService.storeFavicon(params.domainName);

    const newFavicon = await this.faviconService.fetchFaviconFromStorage(
      params.domainName,
      parseInt(size),
    );

    if (newFavicon) {
      return this.returnWithComputedResponseContentType(res, newFavicon);
    }

    return res.status(400).send('Could not fetch favicon');
  }

  private returnWithComputedResponseContentType(
    res: Response,
    favicon: Readable,
  ) {
    res.set({
      'Content-Type': 'image/png',
    });
    return favicon.pipe(res);
  }

  public checkDomainIsValid(domainName: string) {
    const domainPattern =
      /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
    return domainPattern.test(domainName);
  }

  public checkSizeIsValid(size: number) {
    return SUPPORTED_SIZES.includes(size);
  }
}
