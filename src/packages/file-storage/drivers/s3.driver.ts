import { Readable } from 'stream';

import {
  CreateBucketCommandInput,
  GetObjectCommand,
  HeadBucketCommandInput,
  NotFound,
  PutObjectCommand,
  S3,
  S3ClientConfig,
  ListObjectsV2Command,
  _Object,
} from '@aws-sdk/client-s3';

import { StorageDriver } from './interfaces/storage-driver.interface';

export interface S3DriverOptions extends S3ClientConfig {
  bucketName: string;
  region: string;
}

export class S3Driver implements StorageDriver {
  private s3Client: S3;
  private bucketName: string;

  constructor(options: S3DriverOptions) {
    const { bucketName, region, ...s3Options } = options;

    if (!bucketName || !region) {
      return;
    }

    this.s3Client = new S3({ ...s3Options, region });
    this.bucketName = bucketName;
  }

  public get client(): S3 {
    return this.s3Client;
  }

  async write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Key: `${params.folder}/${params.name}`,
      Body: params.file,
      ContentType: params.mimeType,
      Bucket: this.bucketName,
    });

    await this.s3Client.send(command);
  }

  async read(params: {
    folderPath: string;
    filename: string;
  }): Promise<Readable> {
    const command = new GetObjectCommand({
      Key: `${params.folderPath}/${params.filename}`,
      Bucket: this.bucketName,
    });
    try {
      const file = await this.s3Client.send(command);
      if (!file || !file.Body || !(file.Body instanceof Readable)) {
        throw new Error('Unable to get file stream');
      }

      return Readable.from(file.Body);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async checkBucketExists(args: HeadBucketCommandInput) {
    try {
      await this.s3Client.headBucket(args);

      return true;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFound) {
        return false;
      }

      throw error;
    }
  }

  async createBucket(args: CreateBucketCommandInput) {
    const exist = await this.checkBucketExists({
      Bucket: args.Bucket,
    });

    if (exist) {
      return;
    }

    return this.s3Client.createBucket(args);
  }

  async getOlderObjects(bucket: string, olderThan: Date, chunkSize = 1000) {
    let isTruncated = true;
    let marker: string;
    const olderObjects: _Object[] = [];

    while (isTruncated && olderObjects.length < chunkSize) {
      const command = new ListObjectsV2Command({
        MaxKeys: chunkSize,
        Bucket: bucket,
        ...(marker && { ContinuationToken: marker }),
      });

      const response = await this.s3Client.send(command);
      const filteredObjects = response.Contents.filter(
        (item) => item.LastModified < olderThan,
      );

      filteredObjects.forEach((item) => {
        if (olderObjects.length < chunkSize) {
          olderObjects.push(item);
        }
      });

      isTruncated = response.IsTruncated;
      marker = response.NextContinuationToken;
    }

    return olderObjects;
  }

  async listFiles(chunkSize: number, olderThan: Date) {
    const files = await this.getOlderObjects(
      this.bucketName,
      olderThan,
      chunkSize,
    );

    const domains = files.map(({ Key }) => Key.split('/')[1]);
    const uniqueDomains = [...new Set(domains)];

    return uniqueDomains;
  }
}
