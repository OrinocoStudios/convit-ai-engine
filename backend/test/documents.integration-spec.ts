import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  createMongoMemoryServer,
  stopMongoMemoryServer,
  getMongoUri,
} from './helpers/integration-setup';
import { DocumentsModule } from '../src/modules/documents/documents.module';

describe('Documents (integration)', () => {
  let app: INestApplication;
  const storagePath = path.join(__dirname, 'test-storage');

  beforeAll(async () => {
    await createMongoMemoryServer();
    const mongoUri = getMongoUri();

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ 
            MONGO_URI: mongoUri,
            STORAGE_BASE_PATH: storagePath
          })],
        }),
        MongooseModule.forRoot(mongoUri),
        DocumentsModule,
      ],
    }).compile();

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
    try {
      await fs.rm(storagePath, { recursive: true, force: true });
    } catch (e) {}
  });

  it('sube un documento global y lo persiste en disco', async () => {
    const tenantId = 'hosp_test';
    const doctorId = 'doc_123';
    const fileContent = 'Contenido de prueba';
    const buffer = Buffer.from(fileContent);

    const res = await request(app.getHttpServer())
      .post('/documents')
      .set('x-tenant-id', tenantId)
      .set('x-doctor-user-id', doctorId)
      .field('kind', 'global_library')
      .field('filename', 'test.txt')
      .attach('file', buffer, 'test.txt')
      .expect(201);

    expect(res.body.tenantId).toBe(tenantId);
    expect(res.body.kind).toBe('global_library');
    expect(res.body.filename).toBe('test.txt');
    expect(res.body.storageKey).toBeDefined();

    // Verificar que el archivo existe en disco
    const filePath = path.join(storagePath, res.body.storageKey);
    const savedContent = await fs.readFile(filePath, 'utf-8');
    expect(savedContent).toBe(fileContent);
  });

  it('sube un documento de paciente y valida patientId', async () => {
    const tenantId = 'hosp_test';
    const doctorId = 'doc_123';
    const patientId = 'p_456';
    const buffer = Buffer.from('data');

    const res = await request(app.getHttpServer())
      .post('/documents')
      .set('x-tenant-id', tenantId)
      .set('x-doctor-user-id', doctorId)
      .field('kind', 'patient')
      .field('patientId', patientId)
      .field('filename', 'p.pdf')
      .attach('file', buffer, 'p.pdf')
      .expect(201);

    expect(res.body.patientId).toBe(patientId);
    expect(res.body.storageKey).toContain(tenantId);
  });
});
