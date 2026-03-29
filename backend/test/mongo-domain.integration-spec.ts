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
import { PatientsModule } from '../src/modules/patients/patients.module';
import { DocumentsModule } from '../src/modules/documents/documents.module';
import { AuditModule } from '../src/modules/audit/audit.module';

describe('Mongo domain (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await createMongoMemoryServer();
    const mongoUri = getMongoUri();

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ MONGO_URI: mongoUri })],
        }),
        MongooseModule.forRoot(mongoUri),
        PatientsModule,
        DocumentsModule,
        AuditModule,
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
  });

  it('persiste paciente, documento y auditoría en MongoDB', async () => {
    const p = await request(app.getHttpServer())
      .post('/patients')
      .set('x-tenant-id', 't1')
      .send({ name: 'Paciente Uno', dni: '12345678A' })
      .expect(201);

    expect(p.body.name).toBe('Paciente Uno');
    expect(p.body.tenantId).toBe('t1');
    const patientId = p.body._id as string;

    const g = await request(app.getHttpServer())
      .post('/documents')
      .set('x-tenant-id', 't1')
      .set('x-doctor-user-id', 'doc_1')
      .send({
        kind: 'global_library',
        filename: 'guia.pdf',
        storageKey: 's3://bucket/guia.pdf',
      })
      .expect(201);

    expect(g.body.kind).toBe('global_library');
    expect(g.body.patientId).toBeUndefined();

    const pd = await request(app.getHttpServer())
      .post('/documents')
      .set('x-tenant-id', 't1')
      .set('x-doctor-user-id', 'doc_1')
      .send({
        kind: 'patient',
        patientId,
        filename: 'informe.pdf',
        storageKey: 's3://bucket/informe.pdf',
      })
      .expect(201);

    expect(pd.body.patientId).toBe(patientId);

    const list = await request(app.getHttpServer())
      .get('/documents')
      .set('x-tenant-id', 't1')
      .query({ patientId })
      .expect(200);

    expect(list.body.length).toBeGreaterThanOrEqual(1);

    const audit = await request(app.getHttpServer())
      .post('/audit/logs')
      .set('x-tenant-id', 't1')
      .set('x-doctor-user-id', 'doc_1')
      .send({
        action: 'TEST_ACTION',
        patientId,
        metadata: { foo: 'bar' },
      })
      .expect(201);

    expect(audit.body.action).toBe('TEST_ACTION');
    expect(audit.body.userId).toBe('doc_1');
  });
});
