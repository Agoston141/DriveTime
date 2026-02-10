import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service';
import {LoginUserDto, RegisterUserDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async authRegisterUser(user:RegisterUserDto){
        const exists = await this.prisma.user.findUnique({where:{
            email:user.email
        },select:{id:true}})

        if(exists) throw new ConflictException('Email already in use');

        const hashedPasswd = await argon2.hash(user.password)

        const registerUser = await this.prisma.user.create({
            data:{
                name:user.name,
                email:user.email,
                password:hashedPasswd,
                role:user.role,
                car:user.car
            },
            select:{
                name:true,
                email:true
            }
        })
    }

    async authLoginUser(user:LoginUserDto){
        const loginStudent = await this.prisma.user.findUnique({
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

    /* async authRegisterInstructor(user:RegisterInstructorDto){
        const exists = await this.prisma.instructor.findUnique({where:{
            email:user.email
        },select:{id:true}})

        if(exists) throw new ConflictException('Email already in use');

        const hashedPasswd = await argon2.hash(user.password)

        const registerInstructor = await this.prisma.instructor.create({
            data:{
                name:user.name,
                email:user.email,
                password:hashedPasswd,
                car:user.car
            },
            select:{
                name:true,
                email:true,
                car:true
            }
        })
    }

    async authLoginInstructor(user:LoginInstructorDto){
        const loginInstructor = await this.prisma.instructor.findUnique({
            where: {email: user.email},
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
            }
        });
        if(!loginInstructor) throw new UnauthorizedException('Hibás email vagy jelszó');

        const ok = await argon2.verify(loginInstructor.password,user.password)
        if(!ok) throw new UnauthorizedException('Hibás jelszó');
        const {password,...loginInst} = loginInstructor
        const payload = {
            sub:loginInst.id,
            email:loginInst.email
        }
        return {user:loginInst,accessToken:this.jwtService.sign(payload)}
    }

    async adminRegister(user:RegisterUserDto){
            const exists = await this.prisma.admin.findUnique({where:{
                email:user.email
            },select:{id:true}})

            if(exists) throw new ConflictException('Email already in use');

            const hashedPasswd = await argon2.hash(user.password)

            const registerAdmin = await this.prisma.admin.create({
                data:{
                    name:user.name,
                    email:user.email,
                    password:hashedPasswd,
                },
                select:{
                    name:true,
                    email:true,
                }
            })
        }

        async adminlogin(user:LoginInstructorDto){
        const loginAdmin = await this.prisma.admin.findUnique({
            where: {email: user.email},
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
            }
        });
        if(!loginAdmin) throw new UnauthorizedException('Hibás email vagy jelszó');

        const ok = await argon2.verify(loginAdmin.password,user.password)
        if(!ok) throw new UnauthorizedException('Hibás jelszó');
        const {password,...loginInst} = loginAdmin
        const payload = {
            sub:loginInst.id,
            email:loginInst.email
        }
        return {user:loginInst,accessToken:this.jwtService.sign(payload)}
    } */
}