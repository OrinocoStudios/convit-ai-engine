import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  createMongoMemoryServer,
  stopMongoMemoryServer,
  getMongoUri,
} from './helpers/integration-setup';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { PatientsModule } from '../src/modules/patients/patients.module';
import { DocumentsModule } from '../src/modules/documents/documents.module';
import { RagModule } from '../src/modules/rag/rag.module';
import { ChatModule } from '../src/modules/chat/chat.module';
import { AuditModule } from '../src/modules/audit/audit.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('App (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await createMongoMemoryServer();
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
            }),
          ],
        }),
        MongooseModule.forRoot(mongoUri),
        AuthModule,
        PatientsModule,
        DocumentsModule,
        RagModule,
        ChatModule,
        AuditModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await stopMongoMemoryServer();
  });

  it('should bootstrap the application', () => {
    expect(app).toBeDefined();
  });

  it('GET / should return Hello World', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });
});
