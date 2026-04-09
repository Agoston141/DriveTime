import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailService } from './../src/mail/mail.service';
import { PrismaService } from './../src/prisma/prisma.service';

jest.setTimeout(60000);

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testEmail = 'e2e-auth@test.hu';
  const testPassword = 'Test1234!';
  const testName = 'E2E Auth Teszt';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue({
        sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
        sendOraAllapot: jest.fn().mockResolvedValue(undefined),
        sendResetMail: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
        exceptionFactory: () => new BadRequestException('Hiányos adatok.'),
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Teszt felhasználó törlése ha már létezik
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.booking.deleteMany({
        where: { OR: [{ studentId: user.id }, { instructorId: user.id }] },
      });
      await prisma.user.delete({ where: { email: testEmail } });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Regisztráció ────────────────────────────────────────────────────────────

  test('POST /auth/registerUser --> 201', async () => {
    return await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: testEmail, password: testPassword })
      .expect(201);
  });

  test('POST /auth/registerUser duplikált email --> 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: testEmail, password: testPassword });

    return await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: testEmail, password: testPassword })
      .expect(409);
  });

  test('POST /auth/registerUser hiányzó mezők --> 400', async () => {
    return await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ email: testEmail })
      .expect(400);
  });

  test('POST /auth/registerUser érvénytelen email --> 400', async () => {
    return await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: 'nem-email', password: testPassword })
      .expect(400);
  });

  // ─── Bejelentkezés ───────────────────────────────────────────────────────────

  test('POST /auth/loginUser --> 201 + accessToken', async () => {
    await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: testEmail, password: testPassword });

    const res = await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: testEmail, password: testPassword })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('POST /auth/loginUser helytelen jelszó --> 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: testName, email: testEmail, password: testPassword });

    return await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: testEmail, password: 'roszszjelszó' })
      .expect(401);
  });

  test('POST /auth/loginUser nem létező email --> 401', async () => {
    return await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: 'nemletezik@test.hu', password: testPassword })
      .expect(401);
  });
});