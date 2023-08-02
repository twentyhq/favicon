import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PackagesModule } from './packages/packages.module';
import { FaviconModule } from './favicon/favicon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PackagesModule,
    FaviconModule,
  ],
})
export class AppModule {}
