import { IsEmail, IsOptional, IsString,IsEnum } from "class-validator";
import { Role } from "../generated/prisma/enums";

export class UpdateInstructorDto{
    @IsOptional() @IsString()
    name?: string;

    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString()
    car?: string;
}

export class addInstructorDto{
    @IsString()
    name!:string

    @IsEmail()
    email!:string

    @IsString()
    password!:string

    @IsString()
    car!:string

    @IsString()
    @IsEnum(Role)
    role!:Role
}