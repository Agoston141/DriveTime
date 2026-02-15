import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUpdateCarStatusDto, UpdateInstructorDto } from './user.dto';
import { CarStatus } from '../generated/prisma/enums';

@Injectable()
export class UserService {
    constructor(private readonly prisma:PrismaService){}

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

    async UpdateCarStatus(id:number,admin:AdminUpdateCarStatusDto){
        const exists = await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})
        if(!exists) throw new NotFoundException("Nincs ilyen oktató");

        return await this.prisma.user.update({where:{id:id,role:'INSTRUCTOR'},data:{
            carStatus:admin.carStatus
        }})
    }
}
