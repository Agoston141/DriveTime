import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:[MailModule],
  providers: [BookingService,MailService],
  controllers: [BookingController]
})
export class BookingModule {}
