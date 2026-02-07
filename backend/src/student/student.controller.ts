import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService:StudentService){}

    @ApiOperation({summary:"Tanuló törlése"})
    @Delete("DeleteStudent/:id")
    async deleteStudentbyId(@Param("id",ParseIntPipe) id:number){
        return await this.studentService.deleteStudentbyid(id)
    }
}
