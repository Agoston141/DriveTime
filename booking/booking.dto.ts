import { IsEnum, IsNumber, IsString } from "class-validator";
import { BookingStatus } from "../generated/prisma/enums";

export class BookClassDto{
    @IsNumber()
    studentId!:number

    @IsNumber()
    instructorId!:number

    @IsString()
    bookedDate!:string
}

export class AcceptBookingDto{
    @IsEnum(BookingStatus)
    bookingStatus!:BookingStatus
}