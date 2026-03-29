import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '');
  const trimmed = corsOrigins?.trim() ?? '';
  if (trimmed && trimmed !== '*') {
    app.enableCors({
      origin: trimmed
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    });
  } else {
    // Sin CORS_ORIGINS: todos los orígenes (solo desarrollo / redes cerradas).
    app.enableCors();
  }

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
}

void bootstrap();
