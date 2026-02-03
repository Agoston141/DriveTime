import { Controller, Get } from '@nestjs/common';
import { InstructorService } from './instructor.service';

@Controller('instructor')
export class InstructorController {
    constructor(private readonly instructorService:InstructorService){}

    @Get('getinstructors')
    async getInstructor(){
        return await this.instructorService.getInstructors()
    }
}
