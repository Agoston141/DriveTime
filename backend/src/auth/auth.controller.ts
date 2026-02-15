import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginUserDto, RegisterUserDto } from './auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @ApiOperation({summary:'Felhasználó regisztrálása'})
    @Post('registerUser')
    async registerUser(@Body() user:RegisterUserDto){
        return await this.authService.authRegisterUser(user)
    }

    @ApiOperation({summary:'Felhasználó bejelentkezése'})
    @Post('loginUser')
    async loginUser(@Body() user: LoginUserDto) {
        return await this.authService.authLoginUser(user);
    }
}
