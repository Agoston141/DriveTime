import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class RegisterUserDto{
    @ApiProperty({example:'Péter'})
    @IsString()
    name!:string;

    @ApiProperty({example:'peter@gmail.com'})
    @IsEmail()
    email!:string;

    @ApiProperty({example:'mai351'})
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
    car?:string 
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

export class LoginAdminDto{
    @IsEmail()
    email!:string;

    @IsString()
    password!:string
}