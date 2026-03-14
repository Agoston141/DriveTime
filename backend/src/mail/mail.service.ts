import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendWelcomeEmail(userEmail: string, userName: string) {
        await this.mailerService.sendMail({
            to: userEmail,
            subject: 'Üdvözlünk a DriveTime-nál!',
            template: './welcome',
            context: { name: userName },
        });
    }
    
    async sendOraAllapot(userEmail: string, userName: string,date:string,status:string) {
        await this.mailerService.sendMail({
            to: userEmail,
            subject: 'Óra állapotával kapcsolatos információk!.',
            template: './oraAllapot', 
            context: { name: userName,date: date,status},
        });
    }
}
