import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { addInstructorDto,UpdateInstructorDto, UpdateUserRoleDto, UpdateUserStatusDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth() 
@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}

    @UseGuards(JwtAuthGuard,RolesGuard)
    @ApiOperation({summary:"Felhasználók törlése"})
    @Roles(Role.ADMIN)
    @Delete("DeleteUser/:id")
    async deleteStudentbyId(@Param("id",ParseIntPipe) id:number){
        return await this.userService.deleteUserbyid(id)
    }

   // @UseGuards(JwtAuthGuard)
    @ApiOperation({summary:"Oktatók listázása"})
    @Get("getinstructors")
    async getInstructor(){
        return await this.userService.getInstructors()
    }

    @ApiOperation({summary:"Oktató frisstése"})
  //  @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.INSTRUCTOR)
    @Patch("update/:id")
    async update(@Param("id",ParseIntPipe) id:number, @Body() instructorDto:UpdateInstructorDto){
        return this.userService.UpdateCar(id,instructorDto)
    }

    /*@ApiOperation({summary:"Admin az autó elfogadása"})
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Patch("updateCarStatus/:id")
    async updateCarstatus(@Param("id",ParseIntPipe) id:number, @Body() admin:AdminUpdateCarStatusDto){
        return this.userService.UpdateCarStatus(id,admin)
    }*/

    @ApiOperation({summary:"Admin oktató feltöltése"})
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.ADMIN)
    @Post("addInstructor")
    async addInstructor(@Body() instructor:addInstructorDto){
        return await this.userService.addInstructor(instructor)
    }

    @ApiOperation({ summary: "Tanulók listázása" })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get("getstudents")
    async getStudents() {
        return await this.userService.getStudents()
    }
    
    @ApiOperation({ summary: "Felhasználó role módosítása" })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch("updateRole/:id")
    async updateRole(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserRoleDto) {
        return await this.userService.updateUserRole(id, dto.role)
    }
    
    @ApiOperation({ summary: "Felhasználó státusz módosítása" })
    @UseGuards(JwtAuthGuard,RolesGuard) //, RolesGuard
    @Roles(Role.ADMIN)
    @Patch("updateStatus/:id")
    async updateStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserStatusDto) {
        return await this.userService.updateUserStatus(id, dto.status)
    }
    
    @ApiOperation({ summary: 'Oktató saját adatai' })
    @UseGuards(JwtAuthGuard)
    @Get('me/:id')
    async getMe(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.getInstructorById(id)
    }

    @ApiOperation({ summary: 'Jelszó visszaállitó email küldése'})
    @Get("sendReset")
    async sendReset(@Body('email') email:string){
        return await this.userService.sendResetMail(email)
    }

    @ApiOperation({ summary: 'Jelszó visszaállitása'})
    @Patch("reset")
    async resetPwd(@Body("email") email:string,@Body("password") passwd:string){
        return await this.userService.resetPwd(email,passwd)
    }

    @Get('Adatbázis adatokkal való feltöltés')
    async seed() {
        return await this.userService.seedData();
    }

}
