/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AwsRegion } from './interfaces/aws-region.interface';
import { StorageType } from './interfaces/storage.interface';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  getStorageType(): StorageType {
    return (
      this.configService.get<StorageType>('STORAGE_TYPE') ?? StorageType.Local
    );
  }

  getStorageS3Region(): AwsRegion | undefined {
    return this.configService.get<AwsRegion>('STORAGE_S3_REGION');
  }

  getStorageS3Name(): string | undefined {
    return this.configService.get<AwsRegion>('STORAGE_S3_NAME');
  }

  getStorageLocalPath(): string {
    return (
      this.configService.get<string>('STORAGE_LOCAL_PATH') ?? '.local-storage'
    );
  }
}
