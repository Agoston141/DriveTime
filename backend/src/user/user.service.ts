import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import argon2 from 'argon2'
import { addInstructorDto, UpdateInstructorDto } from './user.dto';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class UserService {
    constructor(private readonly prisma:PrismaService){}

    async deleteUserbyid(id:number){
            const deleteStudent = await this.prisma.user.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true,
            
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
                car:true,
                status: true,
                role:true
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
            //...(instructor.car && {carStatus:'PENDING'})
        }})
    }
    async getInstructorById(id: number) {
    return await this.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            car: true,
            status: true
        }
    })
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

        async getStudents() {
    return await this.prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true
        }
    })
}

async updateUserRole(id: number, role: Role) {
    const exists = await this.prisma.user.findUnique({ where: { id } })
    if (!exists) throw new NotFoundException("Nincs ilyen felhasználó")
    return await this.prisma.user.update({
        where: { id },
        data: { role }
    })
}

async updateUserStatus(id: number, status: string) {
    const exists = await this.prisma.user.findUnique({ where: { id } })
    if (!exists) throw new NotFoundException("Nincs ilyen felhasználó")
    return await this.prisma.user.update({
        where: { id },
        data: { status }
    })
}

    async addInstructor(instructor:addInstructorDto){
        const exists = await this.prisma.user.findUnique({where:{
            email:instructor.email
        },select:{id:true}})

         if(exists) throw new ConflictException('Az Email már használatba van');
        
        const hashedPasswd = await argon2.hash(instructor.password)

      const registerUser = await this.prisma.user.create({
    data: {
        name: instructor.name,
        email: instructor.email,
        password: hashedPasswd,
        car: instructor.car,    
        status: instructor.status,           
        role: "INSTRUCTOR",
    },
    select: {
        name: true,
        email: true,
        car: true,
        status: true,
        role: true,
    }
})
return registerUser  
    }
}

