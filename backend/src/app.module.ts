import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import * as path from 'path';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BookingModule,
    UserModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT ?? '587'),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"DriveTime" <noreply@drivetime.hu>',
      },
      template: {
        dir: path.resolve('src/templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: false },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}