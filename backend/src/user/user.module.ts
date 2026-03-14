import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports:[AuthModule,MailModule],
  controllers: [UserController],
  providers: [UserService,MailService]
})
export class UserModule {}
