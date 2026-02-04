import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto, LoginInstructorDto, LoginUserDto, RegisterInstructorDto, RegisterUserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('registerStudent')
    async registerUser(@Body() user:RegisterUserDto){
        return await this.authService.authRegisterStudent(user)
    }

    @Post('loginStudent')
    async loginUser(@Body() user: LoginUserDto) {
        return await this.authService.authLoginStudent(user);
    }

    @Post('registerInstructor')
    async registerInstructor(@Body() user:RegisterInstructorDto){
        return await this.authService.authRegisterInstructor(user)
    }

    @Post('loginInstructor')
    async loginInstructor(@Body() user: LoginInstructorDto) {
        return await this.authService.authLoginInstructor(user);
    }

    @Post('loginAdmin')
    async loginAdmin(@Body() user:LoginAdminDto){
        return await this.authService.adminlogin(user)
    }
}
