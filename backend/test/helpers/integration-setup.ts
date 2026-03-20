import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

let mongod: MongoMemoryServer;

export async function createMongoMemoryServer(): Promise<MongoMemoryServer> {
  mongod = await MongoMemoryServer.create();
  return mongod;
}

export async function stopMongoMemoryServer(): Promise<void> {
  if (mongod) {
    await mongod.stop();
  }
}

export function getMongoUri(): string {
  return mongod.getUri();
}

export async function createTestingApp(
  modules: any[],
): Promise<{ app: INestApplication; module: TestingModule }> {
  const mongoUri = getMongoUri();

  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            MONGO_URI: mongoUri,
            BRAIN_SERVICE_URL: 'http://localhost:8000',
            PORT: 3000,
          }),
        ],
      }),
      MongooseModule.forRoot(mongoUri),
      ...modules,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module: moduleFixture };
}
