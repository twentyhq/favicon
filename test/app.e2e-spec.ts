import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) should redirect to GitHub', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(301)
      .expect(
        'Location',
        'https://github.com/twentyhq/favicon/blob/main/README.md',
      );
  });

  it('/health (GET) should return 200', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });
});
