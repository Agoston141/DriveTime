import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstructorService {
    constructor(private readonly prismaService: PrismaService){}
    
    async getInstructors(){
        return await this.prismaService.instructor.findMany({
            select:{
                id:true,
                name:true,
                email:true,
                car:true
            }
        })
    }

    async deleteInstructorsbyId(id:number){
        const exists= await this.prismaService.instructor.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})
        if(!exists) throw new NotFoundException;
        await this.prismaService.instructor.delete({where:{id}})
        return {ok:true}
    }
}