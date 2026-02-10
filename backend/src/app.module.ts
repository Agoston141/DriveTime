import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
//import { InstructorModule } from './instructor/instructor.module';
import { BookingModule } from './booking/booking.module';
//import { StudentModule } from './student/student.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule /*InstructorModule*/, BookingModule, UserModule, /*StudentModule*/],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}