import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptBookingDto, BookClassDto } from './booking.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService,
        private readonly mailService: MailService) { }

    async makebooking(book: BookClassDto) {
        const newBooking = await this.prisma.booking.create({
            data: {
                studentId: book.studentId,
                instructorId: book.instructorId,
                bookedDate: new Date(book.bookedDate)
            }
        })
    }

    async deleteBooking(id: number) {
        const deleteBooking = await this.prisma.booking.findUnique({ where: { id } })
        if (!deleteBooking) throw new NotFoundException("Nincs ilyen foglalás");

        await this.prisma.booking.delete({ where: { id } })
        return { ok: true }
    }

    async acceptBooking(id: number, booking: AcceptBookingDto) {
        const exists = await this.prisma.booking.findUnique({ where: { id: id }, select: { id: true, } })
        if (!exists) throw new NotFoundException("Nincs ilyen foglalás");

        const update = await this.prisma.booking.update({
            where: { id: id }, data: {
                status: booking.bookingStatus
            }, include: { student: true }
        })

        const formattedDate = new Intl.DateTimeFormat('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(update.bookedDate));

        await this.mailService.sendOraAllapot(
            update.student.email,
            update.student.name,
            formattedDate,
            update.status
        )

        return update
    }
}
