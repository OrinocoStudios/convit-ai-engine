# Skill: Escribir tests de integración

## Cuándo usar
Cuando necesites crear o modificar tests de integración para un módulo del backend de Convit AI.

## Stack de testing
- **Vitest** como runner (NO Jest)
- **unplugin-swc** para soporte de decoradores NestJS
- **mongodb-memory-server** para MongoDB in-memory
- **supertest** para requests HTTP
- **@nestjs/testing** para bootstrap de módulos

## Estructura de archivos
```
backend/
  test/
    helpers/
      integration-setup.ts    → Helper reutilizable (ya existe)
    app.integration-spec.ts   → Test de integración general
    <módulo>.integration-spec.ts → Test por módulo
```

- Tests unitarios: `src/**/*.spec.ts`
- Tests de integración: `test/**/*.integration-spec.ts`

## Helper disponible: `test/helpers/integration-setup.ts`
Funciones ya implementadas:
- `createMongoMemoryServer()` → Inicia MongoDB in-memory
- `stopMongoMemoryServer()` → Detiene MongoDB in-memory
- `getMongoUri()` → Retorna la URI del MongoDB in-memory
- `createTestingApp(modules)` → Crea app NestJS completa con Mongo, ConfigModule y ValidationPipe

## Patrón para test de integración de un módulo

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createMongoMemoryServer,
  stopMongoMemoryServer,
  createTestingApp,
} from './helpers/integration-setup';
import { NombreModule } from '../src/modules/nombre/nombre.module';

describe('Nombre (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await createMongoMemoryServer();
    const result = await createTestingApp([NombreModule]);
    app = result.app;
  });

  afterAll(async () => {
    await app?.close();
    await stopMongoMemoryServer();
  });

  it('POST /nombre should create', async () => {
    const response = await request(app.getHttpServer())
      .post('/nombre')
      .send({ tenantId: 'hospital_1', patientId: 'patient_1', /* ... */ });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Patrón para test con módulos dependientes

Si el módulo depende de otros (ej: chat necesita rag), importar ambos:

```typescript
const result = await createTestingApp([ChatModule, RagModule]);
```

## Reglas

### Obligatorias
- **NO usar Jest** — todo con Vitest (`import { describe, it, expect } from 'vitest'`)
- **NO depender de MongoDB externo** — siempre `mongodb-memory-server`
- **NO leer `.env`** — usar `ConfigModule.forRoot({ ignoreEnvFile: true, load: [...] })`
- **Siempre limpiar** en `afterAll`: `app.close()` + `stopMongoMemoryServer()`
- **Importar solo los módulos necesarios**, no `AppModule` completo (excepto en `app.integration-spec.ts`)

### Convenciones
- Usar `beforeAll` / `afterAll` para lifecycle (no `beforeEach` para la app)
- Usar `supertest` para requests HTTP (ya instalado como devDependency)
- Nombre de archivo: `<módulo>.integration-spec.ts`
- Un `describe` principal por módulo
- Tests de endpoints: verificar status code, estructura del body y side effects en DB

### Datos de prueba
- Siempre usar `tenantId` y `patientId` ficticios pero consistentes entre tests del mismo describe
- Ejemplo: `tenantId: 'test-hospital'`, `patientId: 'test-patient-1'`

## Scripts disponibles
```bash
npm run test                    # Unit tests (src/**/*.spec.ts)
npm run test:watch              # Unit tests en modo watch
npm run test:integration        # Integration tests (test/**/*.integration-spec.ts)
npm run test:integration:watch  # Integration tests en modo watch
```

## Configs de Vitest
- `vitest.config.ts` → unit tests
- `vitest.config.integration.ts` → integration tests (timeout 30s)

## Checklist
- [ ] Archivo en `test/<módulo>.integration-spec.ts`
- [ ] Imports de vitest (`describe`, `it`, `expect`, `beforeAll`, `afterAll`)
- [ ] `createMongoMemoryServer()` en `beforeAll`
- [ ] `createTestingApp([...modules])` con solo los módulos necesarios
- [ ] `app.close()` + `stopMongoMemoryServer()` en `afterAll`
- [ ] Requests vía `supertest` con assertions de status + body
- [ ] Datos de prueba con `tenantId` y `patientId` ficticios
- [ ] Test pasa con `npm run test:integration`
