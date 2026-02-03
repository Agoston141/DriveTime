import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto, RegisterUserDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async authRegisterStudent(user:RegisterUserDto){
        const exists = await this.prisma.student.findUnique({where:{
            email:user.email
        },select:{id:true}})

        if(exists) throw new ConflictException('Email already in use');

        const hashedPasswd = await argon2.hash(user.password)

        const registerUser = await this.prisma.student.create({
            data:{
                name:user.name,
                email:user.email,
                password:hashedPasswd
            },
            select:{
                name:true,
                email:true
            }
        })
    }

    async authLoginStudent(user:LoginUserDto){
        const loginStudent = await this.prisma.student.findUnique({
            where: {email: user.email},
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
            }
        });

        if(!loginStudent) throw new UnauthorizedException('Hibás email vagy jelszó');

        const ok = await argon2.verify(loginStudent.password,user.password)
        if(!ok) throw new UnauthorizedException('Hibás jelszó');
        const {password,...loguser} = loginStudent

        const payload = {
            sub:loguser.id,
            email:loguser.email
        }

        return {user:loguser,accessToken:this.jwtService.sign(payload)}
    }
}
