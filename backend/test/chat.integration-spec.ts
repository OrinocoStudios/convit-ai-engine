import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  createMongoMemoryServer,
  stopMongoMemoryServer,
  getMongoUri,
} from './helpers/integration-setup';
import { ChatModule } from '../src/modules/chat/chat.module';
import { RagService } from '../src/modules/rag/rag.service';

describe('Chat (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await createMongoMemoryServer();
    const mongoUri = getMongoUri();

    const ragStub = {
      query: async () => ({
        answer: 'Respuesta de prueba',
        sources: [
          {
            scope: 'GLOBAL_LIBRARY',
            source: 'test',
            documentId: 'doc1',
            content: 'ctx',
          },
        ],
      }),
      summarize: async () => 'Resumen',
      ingest: async () => undefined,
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ MONGO_URI: mongoUri, BRAIN_SERVICE_URL: 'http://localhost:9' })],
        }),
        MongooseModule.forRoot(mongoUri),
        ChatModule,
      ],
    })
      .overrideProvider(RagService)
      .useValue(ragStub)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await stopMongoMemoryServer();
  });

  it('crea sesión anónima con vínculo a médicos y añade mensaje', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/sessions')
      .set('x-tenant-id', 'tenant_a')
      .set('x-doctor-user-id', 'doc_garcia')
      .send({
        patientId: 'patient_1',
        clinicalHistoryId: 'hist_1',
        additionalDoctorUserIds: ['doc_martinez'],
      })
      .expect(201);

    expect(res.body.anonymousPublicId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(res.body.doctorUserIds.sort()).toEqual(
      ['doc_garcia', 'doc_martinez'].sort(),
    );
    expect(res.body.primaryDoctorUserId).toBe('doc_garcia');
    expect(res.body.patientId).toBeUndefined();

    const aid = res.body.anonymousPublicId as string;

    await request(app.getHttpServer())
      .post(`/chat/sessions/${aid}/messages`)
      .set('x-tenant-id', 'tenant_a')
      .send({
        role: 'user',
        content: 'Pregunta de prueba',
        authorDoctorUserId: 'doc_garcia',
      })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`/chat/sessions/${aid}/messages`)
      .set('x-tenant-id', 'tenant_a')
      .expect(200);

    expect(list.body).toHaveLength(2);
    expect(list.body[0].role).toBe('user');
    expect(list.body[0].content).toBe('Pregunta de prueba');
    expect(list.body[0].authorDoctorUserId).toBe('doc_garcia');
    expect(list.body[1].role).toBe('assistant');
    expect(list.body[1].content).toBe('Respuesta de prueba');
  });
});
