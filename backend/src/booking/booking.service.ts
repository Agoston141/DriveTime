import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookClassDto } from './booking.dto';

@Injectable()
export class BookingService {
    constructor(private readonly prisma:PrismaService){}

    async makebooking(book:BookClassDto){
        const newBooking= await this.prisma.booking.create({
            data:{
                studentId:book.studentId,
                instructorId:book.instructorId,
                bookedDate:new Date(book.bookedDate)
            }
        })
    }
}
