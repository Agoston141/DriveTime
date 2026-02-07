import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
    constructor(private readonly prisma:PrismaService){}

    async deleteStudentbyid(id:number){
            const deleteStudent = await this.prisma.student.findUnique({where:{id},select:{
            id:true,
            name:true,
            email:true
        }})

        if(!deleteStudent) throw new NotFoundException("Nincs ilyen tanuló");

        await this.prisma.student.delete({where:{id}})
        return {ok:true}
    }
}
