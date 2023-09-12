import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PackagesModule } from './packages/packages.module';
import { FaviconModule } from './favicon/favicon.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './packages/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PackagesModule,
    FaviconModule,
    ScheduleModule.forRoot(),
    TasksModule,
  ],
})
export class AppModule {}
