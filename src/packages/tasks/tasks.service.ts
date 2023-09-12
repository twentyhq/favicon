import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DomainCommandService } from '../commands/commands.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private readonly domainCommandService: DomainCommandService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.debug('Updating oldest domains');
    await this.domainCommandService
      .refetchOldestDomains()
      .catch(this.logger.error);
  }
}
