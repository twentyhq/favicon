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
    const existingFavicon = await this.faviconService.fetchFavicon(
      params.domainName,
    );

    if (existingFavicon) {
      res.set({
        'Content-Type': this.faviconService.computeResponseContentType(
          existingFavicon.extension,
        ),
      });
      return existingFavicon.file.pipe(res);
    }

    await this.faviconService.storeFavicon(params.domainName);

    const newFavicon = await this.faviconService.fetchFavicon(
      params.domainName,
    );

    if (newFavicon) {
      res.set({
        'Content-Type': this.faviconService.computeResponseContentType(
          newFavicon.extension,
        ),
      });
      return newFavicon.file.pipe(res);
    }

    return res.status(400).send('Could not fetch favicon');
  }
}
