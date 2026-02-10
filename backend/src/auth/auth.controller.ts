import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginUserDto, RegisterUserDto } from './auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @ApiOperation({summary:'Diák regisztrálása'})
    @Post('registerUser')
    async registerUser(@Body() user:RegisterUserDto){
        return await this.authService.authRegisterUser(user)
    }

    @ApiOperation({summary:'Diák bejelentkezése'})
    @Post('loginUser')
    async loginUser(@Body() user: LoginUserDto) {
        return await this.authService.authLoginUser(user);
    }

    /* @ApiOperation({summary:'Oktató regisztrálása'})
    @Post('registerInstructor')
    async registerInstructor(@Body() user:RegisterInstructorDto){
        return await this.authService.authRegisterInstructor(user)
    }

    @ApiOperation({summary:'Oktató bejelentkezése'})
    @Post('loginInstructor')
    async loginInstructor(@Body() user: LoginInstructorDto) {
        return await this.authService.authLoginInstructor(user);
    }

    @ApiOperation({summary:'Admin regisztrálása'})
    @Post('registerAdmin')
    async registerAdmin(@Body() user:RegisterUserDto){
        return await this.authService.adminRegister(user)
    }

    @ApiOperation({summary:'Admin bejelentkezése'})
    @Post('loginAdmin')
    async loginAdmin(@Body() user:LoginAdminDto){
        return await this.authService.adminlogin(user)
    } */
}
