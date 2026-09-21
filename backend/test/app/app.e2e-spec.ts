import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// The application module is booted directly — bootstrap never runs. Anything
// asserted here therefore only holds because the response interceptor, the
// exception filter and the validation pipes are registered in the module itself.
describe('Application stack (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterEach(() => connection.dropDatabase());

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('wraps a successful response in the success envelope', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ username: 'envelope', password: 'password123' })
      .expect(200);

    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      data: 'ثبت نام با موفقیت انجام شد',
    });
  });

  it('answers in the language the request asks for', async () => {
    const res = await request(app.getHttpServer())
      .get('/nope')
      .set('Accept-Language', 'en')
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('reports every failing field, translated, not just the first', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .set('Accept-Language', 'en')
      .send({ username: 'x', password: 'short', phone: 'nope' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: ['password is too short', 'Invalid phone number'],
    });
  });
});
