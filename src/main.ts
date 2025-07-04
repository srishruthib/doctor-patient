// src/main.ts
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1'; // Default to 'api/v1'

  // Set global prefix for all API routes
  app.setGlobalPrefix(apiPrefix);

  // Enable global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that are not defined in the DTO
      forbidNonWhitelisted: false, // Throws an error if non-whitelisted properties are sent
      transform: true, // Automatically transforms payload objects to DTO instances
      disableErrorMessages: false, // Set to true in production for security
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: '*', // For development, allow all origins. Restrict in production.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000; // Default to 3000
  await app.listen(port);
  console.log(`Application is running on: http://[::1]:${port}`);
}
bootstrap();
