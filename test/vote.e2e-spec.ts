import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/infrastructure/auth/auth.service';

describe('VoteController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();

    // Créer un token pour les tests
    const loginResult = await authService.login({
      email: 'test@example.com',
      sub: 'test123',
      roles: ['user'],
    });
    accessToken = loginResult.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/votes (POST) - should create a vote', () => {
    return request(app.getHttpServer())
      .post('/votes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        optionId: 'option123',
      })
      .expect(201)
      .expect(res => {
        expect(res.body.message).toBe('Vote cast successfully');
      });
  });

  it('/votes/:id (GET) - should get a vote', () => {
    return request(app.getHttpServer())
      .get('/votes/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
      });
  });

  it('/votes/statistics/:optionId (GET) - should get statistics', () => {
    return request(app.getHttpServer())
      .get('/votes/statistics/option123')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeDefined();
        expect(res.body.totalVotes).toBeDefined();
        expect(res.body.percentage).toBeDefined();
      });
  });
});
