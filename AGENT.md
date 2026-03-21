# Convit AI Engine – Agent Context

## Qué es este proyecto
Convit AI es una plataforma interna para hospitales que permite consultar información clínica de pacientes mediante IA. NO es un chatbot — es un sistema de acceso seguro, rápido y trazable a información clínica.

El contexto RAG se organiza por **clínica (tenant)**: **biblioteca global** de PDFs compartidos, **pacientes** compartidos entre doctores del tenant, **documentos del paciente** (incl. acceso vía tool calls para archivos pequeños), e **historias clínicas** bajo cada paciente. Los “Chat 1 / Chat 2” de producto son **resúmenes de conversaciones** persistidos en **una base de datos distinta** al corpus principal de embeddings.

## Regla fundamental
> **"La IA no responde, la IA cita."**
> Toda respuesta generada por el sistema DEBE incluir fuentes. Si no hay fuentes, no se responde.

## Reglas críticas (NO NEGOCIABLES)
- La IA **NO toma decisiones clínicas**
- La IA **resume, organiza y cita** información existente
- Los datos **NO salen del entorno del hospital** (on-premise)
- Toda respuesta es **auditable y trazable**
- **NO inventar información** — si no hay contexto suficiente, decir que no hay datos
- **tenantId** obligatorio en todo acceso a datos clínicos o corpus del hospital
- **patientId** obligatorio cuando el ámbito incluye datos de un paciente; la **biblioteca global** no lleva `patientId`
- **clinicalHistoryId** cuando la consulta o el dato está acotado a una historia clínica (incl. resúmenes “Chat N”)
- **NO usar APIs externas** — todo corre local

## Arquitectura
- **Monolito modular** (NestJS) — NO microservicios
- **Brain Service** como servicio RAG externo (corpus: global + paciente según `scope`)
- **DB de resúmenes / conversaciones** separada del índice vectorial principal para los “Chat N”
- **Frontend** en Next.js

### Componentes
- **Backend (NestJS)**: Auth, control de acceso, auditoría, API REST, orquestación de contexto (RAG + resúmenes)
- **Brain Service**: Ingesta de documentos al corpus RAG, embeddings, GraphRAG, query con restricción de ámbito
- **Neo4j**: Grafo de relaciones clínicas (según diseño)
- **MongoDB**: Datos operacionales
- **Ollama**: Servidor LLM local (Qwen)

### Flujo principal
```
Usuario → Frontend → Backend → Brain Service (+ DB resúmenes si aplica) → Backend → Frontend
```

El backend **no** debe inventar fusión de contexto sin trazabilidad: cada bloque inyectado debe poder reflejarse en `sources` (incl. `CHAT_SUMMARY` cuando proceda).

## Módulos del backend
```
/modules
  /auth          → Autenticación y autorización
  /patients      → Gestión de pacientes
  /documents     → Upload y listado (global vs paciente)
  /rag           → Integración con Brain Service
  /chat          → Endpoint de chat (paciente + historia clínica)
  /audit         → Registro de auditoría
```

(Se pueden añadir módulos `clinical-histories` / `chat-summaries` según evolución del código.)

## Tech stack
- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js + React + TypeScript
- **Base de datos**: Neo4j (grafo) + MongoDB (operacional) + almacén de resúmenes de chat (definición de despliegue)
- **RAG**: Brain Service (servicio externo)
- **LLM**: Ollama con Qwen (local)
- **Infra**: Docker Compose

## Modelo de datos clave
Ver `docs/04-data-model.md`. Resumen:
- **GlobalLibraryDocument**: `tenantId` (sin `patientId`)
- **PatientDocument**, **ClinicalHistory**, **ChatSummary**: `tenantId` + `patientId`; historia y resúmenes llevan `clinicalHistoryId`
- **Chunk**: `tenantId`; `patientId` nullable si el chunk es de biblioteca global
- **AuditLog**: incluir `clinicalHistoryId` cuando la acción sea por historia

## API del Brain Service (evolutivo)
```
POST /query
{
  "query": "texto",
  "tenantId": "hospital_1",
  "patientId": "123",           // omitir o null solo para query puramente global
  "clinicalHistoryId": "hist_456",
  "scopes": ["GLOBAL_LIBRARY", "PATIENT_DOCUMENT", "CLINICAL_HISTORY"]
}

Response:
{
  "answer": "...",
  "sources": [ { ..., "scope": "GLOBAL_LIBRARY | PATIENT_DOCUMENT | CHAT_SUMMARY" } ]
}
```

Los resúmenes “Chat N” pueden añadirse al payload de fuentes en el **backend** si se leen desde la DB de resúmenes, manteniendo el mismo contrato hacia el cliente.

## Convenciones de código
- TypeScript estricto en todo el proyecto
- Cada módulo NestJS tiene: `*.module.ts`, `*.controller.ts`, `*.service.ts`
- DTOs con class-validator para validación
- Endpoints con datos de paciente: validar `patientId` + `tenantId`; historias: `clinicalHistoryId`
- Nombres de archivos en kebab-case
- Clases en PascalCase
- Variables y funciones en camelCase
- Tests con Vitest

## Testing
- **Runner**: Vitest (NO Jest)
- **SWC**: Se usa `unplugin-swc` para soporte de decoradores NestJS en Vitest
- **Tests unitarios**: `backend/src/**/*.spec.ts` → `npm test`
- **Tests de integración**: `backend/test/**/*.integration-spec.ts` → `npm run test:integration`
- **MongoDB en tests**: Se usa `mongodb-memory-server` — NUNCA depender de un MongoDB externo para tests
- **Helper reutilizable**: `test/helpers/integration-setup.ts` provee:
  - `createMongoMemoryServer()` / `stopMongoMemoryServer()` → lifecycle de MongoDB in-memory
  - `getMongoUri()` → URI para inyectar en MongooseModule
  - `createTestingApp(modules)` → crea una app NestJS completa con Mongo in-memory, ConfigModule y ValidationPipe
- **Reglas de tests de integración**:
  - Usar `beforeAll` / `afterAll` (no `beforeEach`) para el lifecycle de la app y MongoDB
  - Siempre llamar `app.close()` y `stopMongoMemoryServer()` en `afterAll`
  - Usar `supertest` para hacer requests HTTP contra la app
  - Los tests de integración de un módulo solo deben importar los módulos necesarios, no `AppModule` completo
  - Config vía `ConfigModule.forRoot({ ignoreEnvFile: true, load: [...] })` — nunca leer `.env` en tests
- **Configs de Vitest**:
  - `vitest.config.ts` → unit tests
  - `vitest.config.integration.ts` → integration tests (timeout 30s)

## Seguridad
- Aislamiento por `tenantId` (hospital); por `patientId` cuando el dato es del paciente
- Sin dependencias de servicios externos
- Deploy on-premise obligatorio
- Toda acción sobre datos de paciente u historia se registra en audit log

## Documentación
Los documentos de diseño están en `/docs`:
- `00-overview.md` → Visión general y principios
- `01-architecture.md` → Arquitectura y componentes
- `02-e2e-flows.md` → Flujos end-to-end
- `03-rag-integration.md` → Integración con Brain Service y ámbitos RAG
- `04-data-model.md` → Modelo de datos
- `05-api-contracts.md` → Contratos de API
- `06-backlog.md` → Plan de sprints
- `07-security.md` → Seguridad y aislamiento
- `08-deployment.md` → Deployment con Docker

## Skills
Los skills accionables para tareas específicas están en `/.skills/`:
- `nestjs-module.md` → Cómo crear un módulo NestJS en este proyecto
- `rag-integration.md` → Cómo integrar con Brain Service
- `security-isolation.md` → Reglas de aislamiento por tenant/paciente/historia
- `api-endpoint.md` → Cómo crear un nuevo endpoint REST
- `data-model.md` → Cómo definir entidades siguiendo el patrón del proyecto
- `integration-testing.md` → Cómo escribir tests de integración

## Antes de escribir código
1. Lee este archivo completo
2. Consulta el doc relevante en `/docs` si necesitas más contexto
3. Sigue el skill correspondiente en `/.skills/` para la tarea
4. NUNCA generes respuestas de IA sin fuentes
5. SIEMPRE incluye `tenantId`; `patientId` y `clinicalHistoryId` según el ámbito
6. SIEMPRE registra en audit log las operaciones sobre datos clínicos relevantes
