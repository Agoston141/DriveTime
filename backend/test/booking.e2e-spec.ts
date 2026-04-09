import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailService } from './../src/mail/mail.service';
import { PrismaService } from './../src/prisma/prisma.service';
import argon2 from 'argon2';

jest.setTimeout(60000);

describe('Booking (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let studentToken: string;
  let instructorToken: string;
  let adminToken: string;
  let studentId: number;
  let instructorId: number;
  let bookingId: number;

  const studentEmail = 'e2e-booking-student@test.hu';
  const instructorEmail = 'e2e-booking-instructor@test.hu';
  const adminEmail = 'e2e-booking-admin@test.hu';
  const testEmails = [studentEmail, instructorEmail, adminEmail];

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

    // Korábbi tesztadatok takarítása
    const users = await prisma.user.findMany({
      where: { email: { in: testEmails } },
      select: { id: true },
    });
    const ids = users.map((u) => u.id);
    if (ids.length > 0) {
      await prisma.booking.deleteMany({
        where: { OR: [{ studentId: { in: ids } }, { instructorId: { in: ids } }] },
      });
    }
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });

    // Tanuló regisztráció + login
    await request(app.getHttpServer())
      .post('/auth/registerUser')
      .send({ name: 'Teszt Tanuló', email: studentEmail, password: 'Student1!' });

    const studentRes = await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: studentEmail, password: 'Student1!' });
    studentToken = studentRes.body.accessToken;
    studentId = studentRes.body.user.id;

    // Oktató direktben (role miatt)
    const instructor = await prisma.user.create({
      data: {
        name: 'Teszt Oktató',
        email: instructorEmail,
        password: await argon2.hash('Instructor1!'),
        role: 'INSTRUCTOR',
        car: 'Skoda Fabia',
      },
    });
    instructorId = instructor.id;

    const instrRes = await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: instructorEmail, password: 'Instructor1!' });
    instructorToken = instrRes.body.accessToken;

    // Admin direktben
    await prisma.user.create({
      data: {
        name: 'Teszt Admin',
        email: adminEmail,
        password: await argon2.hash('Admin1!'),
        role: 'ADMIN',
      },
    });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/loginUser')
      .send({ email: adminEmail, password: 'Admin1!' });
    adminToken = adminRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Foglalás létrehozása ────────────────────────────────────────────────────

  test('POST /booking/makeBooking --> 201', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const res = await request(app.getHttpServer())
      .post('/booking/makeBooking')
      .send({ studentId, instructorId, bookedDate: futureDate.toISOString() })
      .expect(201);

    expect(res.body.status).toBe('PENDING');
    bookingId = res.body.id;
  });


  // ─── Saját foglalások lekérése ───────────────────────────────────────────────

  test('GET /booking/mybookings/:studentId --> 200', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await request(app.getHttpServer())
      .post('/booking/makeBooking')
      .send({ studentId, instructorId, bookedDate: futureDate.toISOString() });

    const res = await request(app.getHttpServer())
      .get(`/booking/mybookings/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /booking/mybookings/:studentId token nélkül --> 401', async () => {
    return await request(app.getHttpServer())
      .get(`/booking/mybookings/${studentId}`)
      .expect(401);
  });

  // ─── Oktató foglalásai ───────────────────────────────────────────────────────

  test('GET /booking/instructorbookings/:instructorId --> 200', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await request(app.getHttpServer())
      .post('/booking/makeBooking')
      .send({ studentId, instructorId, bookedDate: futureDate.toISOString() });

    const res = await request(app.getHttpServer())
      .get(`/booking/instructorbookings/${instructorId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ─── Összes foglalás (admin) ─────────────────────────────────────────────────

  test('GET /booking/getbookings admin --> 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/booking/getbookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /booking/getbookings nem admin --> 403', async () => {
    return await request(app.getHttpServer())
      .get('/booking/getbookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  // ─── Foglalás elfogadása ─────────────────────────────────────────────────────

  test('PATCH /booking/acceptBooking/:id ACCEPTED --> 200', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const booking = await request(app.getHttpServer())
      .post('/booking/makeBooking')
      .send({ studentId, instructorId, bookedDate: futureDate.toISOString() });

    const res = await request(app.getHttpServer())
      .patch(`/booking/acceptBooking/${booking.body.id}`)
      .send({ bookingStatus: 'ACCEPTED' })
      .expect(200);

    expect(res.body.status).toBe('ACCEPTED');
  });

  test('PATCH /booking/acceptBooking/:id érvénytelen státusz --> 400', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const booking = await request(app.getHttpServer())
      .post('/booking/makeBooking')
      .send({ studentId, instructorId, bookedDate: futureDate.toISOString() });

    return await request(app.getHttpServer())
      .patch(`/booking/acceptBooking/${booking.body.id}`)
      .send({ bookingStatus: 'NEMLETEZIK' })
      .expect(400);
  });

  test('PATCH /booking/acceptBooking/999999 nem létező --> 404', async () => {
    return await request(app.getHttpServer())
      .patch('/booking/acceptBooking/999999')
      .send({ bookingStatus: 'ACCEPTED' })
      .expect(404);
  });
});