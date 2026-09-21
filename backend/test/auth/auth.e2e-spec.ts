import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  const user = { username: 'Alice', password: 'password123' };

  const http = () => request(app.getHttpServer());

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

  it('signs up, signs in (username is case-insensitive) and reads /auth/me', async () => {
    await http().post('/auth/sign-up').send(user).expect(200);

    const signIn = await http()
      .post('/auth/sign-in')
      .send({ username: 'alice', password: user.password })
      .expect(201);
    const { accessToken } = signIn.body.data as { accessToken: string };

    const me = await http()
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.data).toMatchObject({ username: 'alice', role: 'USER' });
    expect(me.body.data.password).toBeUndefined();
  });

  it('rejects a duplicate sign-up', async () => {
    await http().post('/auth/sign-up').send(user).expect(200);
    await http().post('/auth/sign-up').send(user).expect(409);
  });

  it('rejects a wrong password and an unauthenticated call', async () => {
    await http().post('/auth/sign-up').send(user).expect(200);
    await http()
      .post('/auth/sign-in')
      .send({ username: 'alice', password: 'wrong-password' })
      .expect(401);
    await http().get('/auth/me').expect(401);
  });
});
