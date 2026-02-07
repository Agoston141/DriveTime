import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': // Unique constraint hiba (pl. foglalt e-mail)
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Ez az adat már létezik (egyedi mező ütközés).',
        });
        break;
      case 'P2003': // Foreign key hiba (ez jött neked!)
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Hibás azonosító: A megadott tanuló vagy oktató nem létezik.',
        });
        break;
      case 'P2025': // Nem található rekord
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'A kért rekord nem található.',
        });
        break;
      default:
        // Minden más Prisma hiba
        super.catch(exception, host);
        break;
    }
  }
}