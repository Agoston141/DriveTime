import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import argon2 from 'argon2'
import { addInstructorDto, resetpwdDto, UpdateInstructorDto } from './user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma:PrismaService,
                private readonly mailService:MailService
    ){}

    async deleteUserbyid(id:number){
            const deleteStudent = await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})

        if(!deleteStudent) throw new NotFoundException("Nincs ilyen tanuló");

        await this.prisma.user.delete({where:{id}})
        return {ok:true}
    }

    async getInstructors(){
        return await this.prisma.user.findMany({where:{role:"INSTRUCTOR"},
            select:{
                id:true,
                name:true,
                email:true,
                car:true
            }
        })
    }

    async deleteInstructorsbyId(id:number){
        const exists= await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})
        if(!exists) throw new NotFoundException("Nincs ilyen oktató");
        await this.prisma.user.delete({where:{id}})
        return {ok:true}
    }

    async UpdateCar(id:number,instructor:UpdateInstructorDto){
        const exists = await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})
        if(!exists) throw new NotFoundException("Nincs ilyen oktató");

        return await this.prisma.user.update({where:{id:id},data:{
            name:instructor.name,
            email:instructor.email,
            car:instructor.car,
            ...(instructor.car && {carStatus:'PENDING'})
        }})
    }

    /*async UpdateCarStatus(id:number,admin:AdminUpdateCarStatusDto){
        const exists = await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})
        if(!exists) throw new NotFoundException("Nincs ilyen oktató");

        return await this.prisma.user.update({where:{id:id,role:'INSTRUCTOR'},data:{
            carStatus:admin.carStatus
        }})
    }*/

    async addInstructor(instructor:addInstructorDto){
        const exists = await this.prisma.user.findUnique({where:{
            email:instructor.email
        },select:{id:true}})

         if(exists) throw new ConflictException('Az Email már használatba van');
        
        const hashedPasswd = await argon2.hash(instructor.password)

        const registerUser = await this.prisma.user.create({
            data:{
                name:instructor.name,
                email:instructor.email,
                password:hashedPasswd,
                role:"INSTRUCTOR",
            },
            select:{
                name:true,
                email:true
            }
        })
    }

    async resetPwd(id:number,user:resetpwdDto){
        const exists = await this.prisma.user.findUnique({where:{id:id}})
        if(!exists) throw new ConflictException('Nincs ilyen felhasználó');

        const hashedPasswd = await argon2.hash(user.password)

        const resetPasswordUser = await this.prisma.user.update({where:{id:id},data:{
            password:hashedPasswd
        }})

        await this.mailService.sendResetMail(
            exists.email,
            exists.name,
            "https://www.youtube.com/"
        )

        return resetPasswordUser
    }
}
