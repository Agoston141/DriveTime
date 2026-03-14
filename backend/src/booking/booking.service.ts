import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptBookingDto, BookClassDto } from './booking.dto';

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

    async getStudentBookings(studentId: number) {
    return await this.prisma.booking.findMany({
        where: { studentId },
        select: {
            id: true,
            bookedDate: true,
            status: true,
            instructor: {
                select: { id: true, name: true, car: true }
            }
        },
        orderBy: { bookedDate: 'asc' }
    })
}

    async getInstructorBookings(instructorId: number) {
    return await this.prisma.booking.findMany({
        where: { instructorId },
        select: {
            id: true,
            bookedDate: true,
            status: true,
            student: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { bookedDate: 'asc' }
    })
}

    async getBookings() {
    return await this.prisma.booking.findMany({
        select: {
            id: true,
            bookedDate: true,
            status: true,
            student: {
                select: { id: true, name: true, email: true }
            },
            instructor: {
                select: { id: true, name: true }
            }
        },
        orderBy: { bookedDate: 'asc' }
    })
}

    async deleteBooking(id:number){
        const deleteBooking = await this.prisma.booking.findUnique({where:{id}})
        if(!deleteBooking) throw new NotFoundException("Nincs ilyen foglalás");

        await this.prisma.booking.delete({where:{id}})
        return {ok:true}
    }

    async acceptBooking(id:number,booking:AcceptBookingDto){
        const exists = await this.prisma.booking.findUnique({where:{id:id},select:{id:true,}})
        if(!exists) throw new NotFoundException("Nincs ilyen oktató");

        return await this.prisma.booking.update({where:{id:id},data:{
            status:booking.bookingStatus
        }})
    }
}
