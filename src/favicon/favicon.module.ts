import { Module } from '@nestjs/common';
import { FaviconController } from './favicon.controller';
import { FaviconService } from './favicon.service';
import { FileService } from './file.service';

@Module({
  controllers: [FaviconController],
  providers: [FaviconService, FileService],
})
export class FaviconModule {}
