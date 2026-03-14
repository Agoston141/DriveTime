import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, UseGuards, Get } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AcceptBookingDto, BookClassDto } from './booking.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../generated/prisma/enums';



@Controller('booking')
export class BookingController {
    constructor(private readonly bookingservice: BookingService) { }

    @ApiOperation({ summary: 'Óra foglalása' })
    /*@UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.STUDENT)*/
    @Post('makeBooking')
    async Bookclass(@Body() user: BookClassDto) {
        return await this.bookingservice.makebooking(user)
    }

    @ApiOperation({ summary: 'Tanuló saját foglalásai' })
    @UseGuards(JwtAuthGuard)
    @Get('mybookings/:studentId')
    async getStudentBookings(@Param('studentId', ParseIntPipe) studentId: number) {
        return await this.bookingservice.getStudentBookings(studentId)
    }

    @ApiOperation({ summary: 'Összes foglalás listázása' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('getbookings')
    async getBookings() {
        return await this.bookingservice.getBookings()
    }

    @ApiOperation({ summary: "Óra törlése" })
    @UseGuards(JwtAuthGuard)
    @Delete("deletebooking/:id")
    async deleteClassbyId(@Param("id") id: number) {
        return await this.bookingservice.deleteBooking(id)
    }

    @ApiOperation({ summary: 'Oktató saját foglalásai' })
    @UseGuards(JwtAuthGuard)
    @Get('instructorbookings/:instructorId')
    async getInstructorBookings(@Param('instructorId', ParseIntPipe) instructorId: number) {
        return await this.bookingservice.getInstructorBookings(instructorId)
    }

    @ApiOperation({ summary: "Admin az autó elfogadása" })
    /* @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.INSTRUCTOR) */
    @Patch("acceptBooking/:id")
    async updateCarstatus(@Param("id", ParseIntPipe) id: number, @Body() booking: AcceptBookingDto) {
        return this.bookingservice.acceptBooking(id, booking)
    }
}
