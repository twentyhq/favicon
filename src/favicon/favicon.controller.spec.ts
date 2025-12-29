import { Test, TestingModule } from '@nestjs/testing';
import { FaviconController } from './favicon.controller';
import { FaviconService } from './favicon.service';
import { FileService } from './file.service';
import { HtmlUrlFetcher } from './url-fetcher/html.url-fetcher';
import { GoogleFaviconUrlFetcher } from './url-fetcher/google-favicon.url-fetcher';
import { FileStorageService } from 'src/packages/file-storage/file-storage.service';
import { STORAGE_DRIVER } from 'src/packages/file-storage/file-storage.constants';

describe('FaviconController', () => {
  let faviconController: FaviconController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FaviconController],
      providers: [
        FaviconService,
        FileService,
        FileStorageService,
        HtmlUrlFetcher,
        GoogleFaviconUrlFetcher,
        {
          provide: STORAGE_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    faviconController = app.get<FaviconController>(FaviconController);
  });

  it('should be defined', () => {
    expect(faviconController).toBeDefined();
  });
});
