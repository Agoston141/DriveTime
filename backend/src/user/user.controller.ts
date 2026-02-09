import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}

    @ApiOperation({summary:"Felhasználók törlése"})
    @Delete("DeleteUser/:id")
    async deleteStudentbyId(@Param("id",ParseIntPipe) id:number){
        return await this.userService.deleteUserbyid(id)
    }

    @ApiOperation({summary:"Oktatók listázása"})
    @Get("getinstructors")
    async getInstructor(){
        return await this.userService.getInstructors()
    }

}
