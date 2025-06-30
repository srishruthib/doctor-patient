import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ All routes will start with /api/v1
  app.setGlobalPrefix('api/v1');

  // ✅ Automatically validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unallowed properties
      forbidNonWhitelisted: true, // (optional) throw error for unknown fields
      transform: true, // (optional) auto-convert payloads to expected types
    }),
  );

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000/api/v1`);
}
bootstrap();
