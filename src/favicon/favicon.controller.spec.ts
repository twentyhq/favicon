import { Test, TestingModule } from '@nestjs/testing';
import { FaviconController } from './favicon.controller';
import { FaviconService } from './favicon.service';

describe('FaviconController', () => {
  let faviconController: FaviconController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FaviconController],
      providers: [FaviconService],
    }).compile();

    faviconController = app.get<FaviconController>(FaviconController);
  });
});
