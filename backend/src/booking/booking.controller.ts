import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookClassDto } from './booking.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingservice:BookingService){}

    @ApiOperation({summary:'Óra foglalása'})
    @Post('makeBooking')
    async Bookclass(@Body() user:BookClassDto){
        return await this.bookingservice.makebooking(user)
    }

    @ApiOperation({summary:"Óra törlése"})
    @Delete("deletebooking/:id")
    async deleteClassbyId(@Param("id") id:number){
        return await this.bookingservice.deleteBooking(id)
    }
}
