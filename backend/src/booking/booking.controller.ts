import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookClassDto } from './booking.dto';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingservice:BookingService){}

    @Post('makeBooking')
    async Bookclass(@Body() user:BookClassDto){
        return await this.bookingservice.makebooking(user)
    }
}
