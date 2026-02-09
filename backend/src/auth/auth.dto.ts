import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "../generated/prisma/enums";


export class RegisterUserDto{
    @IsString()
    name!:string;

    @IsEmail()
    email!:string;

    @IsString()
    password!:string

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsString()
    car?: string;
}

export class LoginUserDto{
    @IsEmail()
    email!:string;

    @IsString()
    password!:string
}