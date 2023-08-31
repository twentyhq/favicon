import { Module } from '@nestjs/common';
import { FaviconController } from './favicon.controller';
import { FaviconService } from './favicon.service';
import { FileService } from './file.service';
import { HtmlUrlFetcher } from './url-fetcher/html.url-fetcher';
import { GoogleFaviconUrlFetcher } from './url-fetcher/google-favicon.url-fetcher';

@Module({
  controllers: [FaviconController],
  providers: [
    FaviconService,
    FileService,
    HtmlUrlFetcher,
    GoogleFaviconUrlFetcher,
  ],
  exports: [FaviconService, FileService],
})
export class FaviconModule {}
