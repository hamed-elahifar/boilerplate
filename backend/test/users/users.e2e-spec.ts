import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthEntity } from '../../src/modules/auth/auth.model';

/**
 * Also the regression test for the generic controller: its bodies are typed by
 * erased type parameters, so without restored metadata no DTO rule would run.
 */
describe('Users (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let users: Model<AuthEntity>;

  const http = () => request(app.getHttpServer());

  const tokenFor = async (username: string, role: 'ADMIN' | 'USER') => {
    await users.create({
      username,
      password: await bcrypt.hash('password123', 10),
      role,
    });
    const res = await http()
      .post('/auth/sign-in')
      .send({ username, password: 'password123' })
      .expect(201);
    return `Bearer ${res.body.data.accessToken as string}`;
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    users = moduleFixture.get<Model<AuthEntity>>(
      getModelToken(AuthEntity.name),
    );
    await app.init();
  });

  afterEach(() => connection.dropDatabase());

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('lets an ADMIN create, read, update and delete users', async () => {
    const admin = await tokenFor('boss', 'ADMIN');

    const created = await http()
      .post('/users')
      .set('Authorization', admin)
      .send({ username: 'bob', password: 'password123' })
      .expect(201);
    expect(created.body.data.password).toBeUndefined();
    const id = created.body.data._id as string;

    await http()
      .post('/auth/sign-in')
      .send({ username: 'bob', password: 'password123' })
      .expect(201);

    await http()
      .patch(`/users/${id}`)
      .set('Authorization', admin)
      .send({ isActive: false })
      .expect(200);
    await http()
      .post('/auth/sign-in')
      .send({ username: 'bob', password: 'password123' })
      .expect(401);

    await http().delete(`/users/${id}`).set('Authorization', admin).expect(204);
    const gone = await http().get(`/users/${id}`).set('Authorization', admin);
    expect(gone.body.data).toBeNull();
  });

  it('runs the DTO validation rules on the generic create', async () => {
    const admin = await tokenFor('boss', 'ADMIN');
    const res = await http()
      .post('/users')
      .set('Authorization', admin)
      .send({ username: 'bob', password: 'short' })
      .expect(400);
    expect(res.body.message).toHaveLength(1);
  });

  it('forbids a USER from managing users', async () => {
    const user = await tokenFor('carol', 'USER');
    await http().get('/users').set('Authorization', user).expect(401);
  });
});
