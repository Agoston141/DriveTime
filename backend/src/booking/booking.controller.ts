import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookClassDto } from './booking.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../generated/prisma/enums';


@Controller('booking')
export class BookingController {
    constructor(private readonly bookingservice:BookingService){}

    @ApiOperation({summary:'Óra foglalása'})
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.STUDENT)
    @Post('makeBooking')
    async Bookclass(@Body() user:BookClassDto){
        return await this.bookingservice.makebooking(user)
    }

    @ApiOperation({summary:"Óra törlése"})
    @UseGuards(JwtAuthGuard)
    @Delete("deletebooking/:id")
    async deleteClassbyId(@Param("id") id:number){
        return await this.bookingservice.deleteBooking(id)
    }


}
