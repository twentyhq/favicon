import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';

import { plainToClass } from 'class-transformer';
import { StorageType } from './interfaces/storage.interface';
import { AwsRegion } from './interfaces/aws-region.interface';
import { IsAWSRegion } from './decorators/is-aws-region.decorator';

import { assert } from 'src/utils/assert';

export class EnvironmentVariables {
  // Storage
  @IsEnum(StorageType)
  @IsOptional()
  STORAGE_TYPE?: StorageType;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION?: AwsRegion;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.S3)
  @IsString()
  STORAGE_S3_NAME?: string;

  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.Local)
  STORAGE_LOCAL_PATH?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
