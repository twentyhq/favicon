import { Controller, Get, Param, Res } from '@nestjs/common';
import { FaviconService } from './favicon.service';
import { Response } from 'express';

@Controller()
export class FaviconController {
  constructor(private readonly faviconService: FaviconService) {}

  @Get('/favicon.ico')
  async getOwnFavicon() {
    return;
  }

  @Get(':domainName')
  async getFavicon(
    @Param() params: { domainName: string },
    @Res() res: Response,
  ) {
    const domainName = params.domainName;
    if (!this.faviconService.checkDomainIsValid(domainName)) {
      return res.status(400).send('Invalid domain');
    }
    const existingFavicon = await this.faviconService.fetchFaviconFromStorage(
      params.domainName,
    );

    if (existingFavicon) {
      return this.returnWithComputedResponseContentType(res, existingFavicon)
    }

    await this.faviconService.storeFavicon(params.domainName);

    const newFavicon = await this.faviconService.fetchFaviconFromStorage(
      params.domainName,
    );

    if (newFavicon) {
      return this.returnWithComputedResponseContentType(res, newFavicon)
    }

    return res.status(400).send('Could not fetch favicon');
  }

  private returnWithComputedResponseContentType(
    res: Response,
    favicon: { extension: string; file: any }
  ) {
    res.set({
      'Content-Type': this.faviconService.computeResponseContentType(
        favicon.extension,
      ),
    });
    return favicon.file.pipe(res);
  }
}
