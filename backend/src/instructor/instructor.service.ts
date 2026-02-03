import { Injectable } from '@nestjs/common';
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
}