import { Module } from '@nestjs/common';
import { FaviconController } from './favicon.controller';
import { FaviconService } from './favicon.service';
import { FileService } from './file.service';
import { HtmlFetchStrategy } from './fetch-strategies/html.fetch-strategy';
import { GoogleFaviconFetchStrategy } from './fetch-strategies/google-favicon.fetch-strategy';

@Module({
  controllers: [FaviconController],
  providers: [FaviconService, FileService, HtmlFetchStrategy, GoogleFaviconFetchStrategy],
})
export class FaviconModule {}
