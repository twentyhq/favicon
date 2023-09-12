import { Module } from '@nestjs/common';

import { DomainCommandService } from './commands.service';
import { FaviconModule } from 'src/favicon/favicon.module';

@Module({
  imports: [FaviconModule],
  providers: [DomainCommandService],
  exports: [DomainCommandService],
})
export class DomainCommandModule {}
