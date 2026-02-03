import { IsEmail, IsOptional, IsString } from "class-validator";

export class RegisterUserDto{
    @IsString()
    name!:string;

    @IsEmail()
    email!:string;

    @IsString()
    password!:string

}

export class RegisterInstructorDto{
    @IsString()
    name!:string;

    @IsEmail()
    email!:string;

    @IsString()
    password!:string
    
    @IsString() @IsOptional()
    cars?:string 
}

export class LoginUserDto{
    @IsEmail()
    email!:string;

    @IsString()
    password!:string
}

export class LoginInstructorDto{
    @IsEmail()
    email!:string;

    @IsString()
    password!:string
}