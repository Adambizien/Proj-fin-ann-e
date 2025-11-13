import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.AUTH_SERVICE_PORT || 3003);
  console.log(`🚀 Auth Service (NestJS) running on port ${process.env.AUTH_SERVICE_PORT || 3003}`);
}
bootstrap();