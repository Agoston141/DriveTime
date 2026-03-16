import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import argon2 from 'argon2';
import { addInstructorDto, UpdateInstructorDto } from './user.dto';
import { Role } from '../generated/prisma/enums';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService
    ) {}

    async deleteUserbyid(id: number) {
        const deleteStudent = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } })
        if (!deleteStudent) throw new NotFoundException("Nincs ilyen tanuló");
        await this.prisma.user.delete({ where: { id } })
        return { ok: true }
    }

    async getInstructors() {
        return await this.prisma.user.findMany({ where: { role: "INSTRUCTOR" },
            select: { id: true, name: true, email: true, car: true, status: true, role: true }
        })
    }

    async getInstructorById(id: number) {
        return await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, car: true, status: true }
        })
    }

    async deleteInstructorsbyId(id: number) {
        const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } })
        if (!exists) throw new NotFoundException("Nincs ilyen oktató");
        await this.prisma.user.delete({ where: { id } })
        return { ok: true }
    }

    async UpdateCar(id: number, instructor: UpdateInstructorDto) {
        const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } })
        if (!exists) throw new NotFoundException("Nincs ilyen oktató");
        return await this.prisma.user.update({ where: { id }, data: {
            name: instructor.name,
            email: instructor.email,
            car: instructor.car,
        }})
    }

    async getStudents() {
        return await this.prisma.user.findMany({ where: { role: "STUDENT" },
            select: { id: true, name: true, email: true, status: true, role: true }
        })
    }

    async updateUserRole(id: number, role: Role) {
        const exists = await this.prisma.user.findUnique({ where: { id } })
        if (!exists) throw new NotFoundException("Nincs ilyen felhasználó")
        return await this.prisma.user.update({ where: { id }, data: { role } })
    }

    async updateUserStatus(id: number, status: string) {
        const exists = await this.prisma.user.findUnique({ where: { id } })
        if (!exists) throw new NotFoundException("Nincs ilyen felhasználó")
        return await this.prisma.user.update({ where: { id }, data: { status } })
    }

    async addInstructor(instructor: addInstructorDto) {
        const exists = await this.prisma.user.findUnique({ where: { email: instructor.email }, select: { id: true } })
        if (exists) throw new ConflictException('Az Email már használatba van');

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
            select: { name: true, email: true, car: true, status: true, role: true }
        })
        return registerUser
    }

    async resetPwd(id: number, password: string) {
        const exists = await this.prisma.user.findUnique({ where: { id } })
        if (!exists) throw new NotFoundException('Nincs ilyen felhasználó');

        const hashedPasswd = await argon2.hash(password)

        const updated = await this.prisma.user.update({
            where: { id },
            data: { password: hashedPasswd }
        })

        await this.mailService.sendResetMail(
            exists.email,
            exists.name,
            "https://www.youtube.com/"
        )

        return updated
    }

    async seedData() {

    // 1. Admin létrehozása/frissítése
    await this.prisma.user.upsert({
      where: { email: 'admin@drivetime.hu' },
      update: {},
      create: {
        email: 'admin@drivetime.hu',
        name: 'Fő Adminisztrátor',
        password: commonPassword,
        role: 'ADMIN',
      },
    });

    // 2. Oktatók listája
    const instructors = [
      { name: 'Kovács János', email: 'janos@gmail.com', car: 'Skoda Octavia' ,password:"oktat1"},
      { name: 'Nagy Piroska', email: 'piroska@gmail.com', car: 'Volkswagen Golf' ,password:"oktat2"},
      { name: 'Tóth Gábor', email: 'gabor@gmail.com', car: 'Ford Focus' ,password:"oktat3"},
      { name: 'Szabó Béla', email: 'bela@gmail.com', car: 'Toyota Auris' ,password:"oktat4"},
      { name: 'Horváth Éva', email: 'eva@gmail.com', car: 'Opel Astra' ,password:"oktat5"},
    ];

    for (const inst of instructors) {
      await this.prisma.user.upsert({
        where: { email: inst.email },
        update: {},
        create: {
          email: inst.email,
          name: inst.name,
          password: await argon2.hash(inst.password),
          role: 'INSTRUCTOR',
          car: inst.car,
        },
      });
    }

    return { status: 'success', count: instructors.length + 1 };
  }
}
