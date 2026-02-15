import { IsEmail, IsOptional, IsString,IsEnum } from "class-validator";
import { CarStatus } from "../generated/prisma/enums";

export class UpdateInstructorDto{
    @IsOptional() @IsString()
    name?: string;

    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString()
    car?: string;
}

export class AdminUpdateCarStatusDto{
    @IsEnum(CarStatus)
    carStatus!:CarStatus
}