import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS ENGEDÉLYEZÉSE ---
  // Ez teszi lehetővé, hogy a React (5173 port) kommunikáljon a NestJS-sel (3000 port)
  app.enableCors({
    origin: 'http://localhost:5173', // A frontend címed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // --------------------------

  app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const config = new DocumentBuilder()
    .setTitle('DriveTime')
    .setDescription("DriveTime Swagger UI")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // A szerver elindítása a .env-ben megadott porton vagy a 3000-esen
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();