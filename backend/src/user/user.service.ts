import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        if(!exists) throw new NotFoundException;
        await this.prisma.user.delete({where:{id}})
        return {ok:true}
    }

}
