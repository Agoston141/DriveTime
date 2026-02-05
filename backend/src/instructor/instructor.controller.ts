import { Controller, Get } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('instructor')
export class InstructorController {
    constructor(private readonly instructorService:InstructorService){}

    @ApiOperation({summary:'Oktatók listázása'})
    @Get('getinstructors')
    async getInstructor(){
        return await this.instructorService.getInstructors()
    }
}
