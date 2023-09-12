import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DomainCommandModule } from '../commands/commands.module';

@Module({
  imports: [DomainCommandModule],
  providers: [TasksService],
})
export class TasksModule {}
