import { IsNumber, IsString } from "class-validator";

export class BookClassDto{
    @IsNumber()
    studentId!:number

    @IsNumber()
    instructorId!:number

    @IsString()
    bookedDate!:string
}