# Backlog técnico — Convit AI (Cursor)

Backlog accionable alineado con **Client** (frontend), **Back** (NestJS en este repo) y **Cerebro** ([Pinky](https://github.com/OrinocoStudios/pinky)). Reglas de producto y datos: [AGENT.md](../../AGENT.md), [docs/04-data-model.md](../04-data-model.md), [docs/05-api-contracts.md](../05-api-contracts.md).

## Leyenda de estado

| Estado        | Significado                          |
| ------------- | ------------------------------------ |
| **Hecho**     | Implementado y usable en el repo     |
| **En curso**  | Trabajo iniciado, incompleto         |
| **Pendiente** | No iniciado o solo diseñado en docs  |

## Alineación de identificadores (decisión de producto)

| ID     | Descripción                                                                                                                                                    | Criterios de aceptación                                                                                                                                                         | Estado      | Referencias                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **ID-1** | Definir si DNI/NSS es el `patientId` expuesto al Cerebro o un campo (`externalPatientId`) con mapeo al `_id` Mongo; unicidad por `tenantId`.                     | Documento corto en `docs/` o sección en modelo de datos; contratos API y Pinky usan el mismo identificador estable; no mezcla de pacientes entre tenants.                     | **Pendiente** | [docs/04-data-model.md](../04-data-model.md), esquema `Patient` |

---

## Epic: Infra / QA

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                    |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------ |
| **INF-1** | Docker Compose: backend + MongoDB operativos en local.                                              | `docker compose up` levanta API y DB; variables documentadas.                                              | **Hecho**   | [docker-compose.yml](../../docker-compose.yml) |
| **INF-2** | Variable `BRAIN_SERVICE_URL` consumida por el cliente HTTP del Back hacia el Cerebro.             | RagService (o equivalente) lee URL desde config; fallo claro si Cerebro no alcanzable en entorno dev.       | **Hecho**   | [docker-compose.yml](../../docker-compose.yml) |
| **INF-3** | (Opcional) Servicio Pinky en Compose o documentación de despliegue conjunto.                      | README o `docs/08-deployment.md` describe cómo levantar Back + Pinky + Ollama.                            | **Pendiente** | [docs/08-deployment.md](../08-deployment.md)   |
| **INF-4** | Healthchecks y/o readiness para backend y dependencias.                                           | Endpoint o probe documentado para orquestación.                                                            | **Pendiente** | —                              |
| **INF-5** | Tests de integración reutilizables (Mongo in-memory, Vitest).                                     | Helpers y convenciones en uso; nuevos módulos críticos con cobertura mínima.                               | **Hecho**   | [backend/test/helpers/integration-setup.ts](../../backend/test/helpers/integration-setup.ts) |
| **INF-6** | Tests de integración para flujo chat persistido.                                                  | Crear sesión, listar mensajes, append mensaje con cabeceras tenant/doctor.                               | **Hecho**   | [backend/test/chat.integration-spec.ts](../../backend/test/chat.integration-spec.ts) |

---

## Epic: Back (NestJS — este repositorio)

### Pacientes y documentos (metadatos)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **BK-1**  | CRUD pacientes por tenant (`POST/GET /patients`).                                                   | Cabecera `x-tenant-id`; listado y detalle por id.                                                          | **Hecho**   | [backend/src/modules/patients/](../../backend/src/modules/patients/) |
| **BK-2**  | Modelo paciente con identificador clínico DNI o NSS (según **ID-1**).                               | Campo(s) validados; unicidad por tenant; búsqueda/lookup para iniciar chat.                                | **Pendiente** | Esquema `Patient`                              |
| **BK-3**  | Metadatos de documentos `global_library` / `patient` (`POST/GET /documents`).                     | Filtros `kind`, `patientId`; cabeceras tenant y doctor.                                                    | **Hecho**   | [backend/src/modules/documents/](../../backend/src/modules/documents/) |
| **BK-4**  | Almacenamiento de ficheros (filesystem o S3-compatible) y `storageKey` real.                        | Upload descargable; política de tamaño para tool calls según diseño.                                       | **Pendiente** | [README.md](../../README.md), docs             |

### Historias clínicas y resúmenes “Chat N”

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **BK-5**  | Entidad **ClinicalHistory** y endpoints (`GET/POST .../clinical-histories`, `GET /clinical-histories/:id`). | Contrato alineado con [docs/05-api-contracts.md](../05-api-contracts.md); aislamiento `tenantId` + `patientId`. | **Hecho**   | [backend/src/modules/clinical-histories/](../../backend/src/modules/clinical-histories/) |
| **BK-6**  | **ChatSummary** en almacén separado (o colección dedicada) y endpoints de listado/creación.       | Vinculado a `clinicalHistoryId`; usable como contexto en respuestas con fuente `CHAT_SUMMARY` si aplica.   | **Pendiente** | [docs/04-data-model.md](../04-data-model.md)   |

### Chat persistido (registro “anónimo”)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **BK-7**  | Sesiones con `anonymousPublicId`; respuestas sin exponer `patientId` al cliente en vistas anónimas. | `POST/GET /chat/sessions`, mensajes por sesión según contrato.                                             | **Hecho**   | [backend/src/modules/chat/chat.service.ts](../../backend/src/modules/chat/chat.service.ts) |
| **BK-8**  | Orquestación **consulta RAG**: endpoint tipo `POST /chat` (o ruta acordada) que llama al Cerebro con `tenantId`, `patientId`, `clinicalHistoryId`, `scopes`. | Respuesta incluye `answer` + `sources`; si no hay fuentes, no inventar: mensaje controlado (p. ej. bienvenida sin datos). | **Hecho**   | [docs/05-api-contracts.md](../05-api-contracts.md), [docs/03-rag-integration.md](../03-rag-integration.md) |
| **BK-9**  | Flujo **inicio de chat**: tras identificador paciente, primera interacción consulta Cerebro; si **no** hay datos médicos, respuesta tipo: bienvenida al nuevo paciente / aún sin datos. | Comportamiento reproducible en tests o manual; coherente con regla “sin fuentes no hay respuesta clínica”. | **Pendiente** | Flujo usuario                                    |
| **BK-10** | Flujo **fin de chat**: generar resumen de la conversación; enviar al Cerebro como documento del paciente; **reindexar** paciente existente o **crear** índice nuevo. | Documentado el orden de llamadas a Pinky; idempotencia o manejo de errores básico.                       | **Pendiente** | Pinky API                                        |
| **BK-11** | Registrar en **audit log** interacciones críticas (consulta RAG, cierre chat, upload) sin depender solo de `POST /audit/logs` manual. | Eventos automáticos con `patientId` / `clinicalHistoryId` / metadata útil.                               | **Hecho**   | [backend/src/modules/audit/](../../backend/src/modules/audit/) |

### Auth y RAG (integración)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **BK-12** | Autenticación real (JWT u otro); sustituir o complementar cabeceras `x-doctor-user-id` en MVP+.    | Usuario identificado; política documentada.                                                                | **Pendiente** | [backend/src/modules/auth/](../../backend/src/modules/auth/) |
| **BK-13** | **RagService**: cliente HTTP hacia Pinky (`POST /query` mínimo); parsing de `answer` y `sources`.   | Módulo RAG deja de estar vacío; errores de red/timeout tratados.                                           | **Hecho**   | [backend/src/modules/rag/rag.service.ts](../../backend/src/modules/rag/rag.service.ts) |
| **BK-14** | Proxy o flujo **upload** de documentos hacia Cerebro + disparo de ingesta/indexación por ámbito.  | Biblioteca global vs paciente según `scope`; coherente con Brain Service.                                  | **Pendiente** | [docs/03-rag-integration.md](../03-rag-integration.md) |

### Auditoría (endpoint base)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| **BK-15** | `POST /audit/logs` con `tenantId`, acción, ids opcionales.                                         | Funcional con cabeceras actuales.                                                                          | **Hecho**   | [backend/src/modules/audit/audit.controller.ts](../../backend/src/modules/audit/audit.controller.ts) |

---

## Epic: Cerebro (Pinky — fuera de este repo)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                    |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------ |
| **CR-1**  | Contrato **query** con aislamiento por `tenantId` y `patientId` (y scopes) documentado y estable.   | Back puede integrar sin ambigüedad; no mezcla de pacientes.                                                | **En curso** (producto) | Repo Pinky, [docs/03-rag-integration.md](../03-rag-integration.md) |
| **CR-2**  | Ingesta de documentos y generación de embeddings / índice alineada con uploads del Back.           | Rutas y payloads acordados (p. ej. upload, incremental/rebuild).                                            | **Pendiente** | Pinky README                   |
| **CR-3**  | Reindexación o actualización incremental tras nuevo documento (p. ej. resumen post-chat).           | Back puede invocar operación documentada tras **BK-10**.                                                   | **Pendiente** | Pinky                          |
| **CR-4**  | Respuestas siempre con trazabilidad de **fuentes**; vacío explícito si no hay contexto.             | Back puede implementar **BK-8** / **BK-9** sin contradicción.                                              | **Pendiente** | Reglas AGENT.md                |

---

## Epic: Client (frontend — no presente aún en este repo)

| ID        | Descripción                                                                                         | Criterios de aceptación                                                                                    | Estado      | Referencias                    |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------ |
| **CL-1**  | Pantalla inicio: médico introduce **DNI o NSS** (o identificador acordado en **ID-1**); enviar inicia chat con Back. | Validación básica; manejo de errores de red.                                                             | **Pendiente** | —                              |
| **CL-2**  | Vista de chat: mensajes, indicación de **fuentes** por respuesta.                                   | Coherente con payload del Back (`sources`).                                                                | **Pendiente** | —                              |
| **CL-3**  | Subida de documentos al flujo del Back (metadatos + fichero según **BK-4** / **BK-14**).            | Feedback de éxito/error; ámbito global vs paciente.                                                       | **Pendiente** | —                              |
| **CL-4**  | Acción **finalizar chat** que dispare resumen + reindex en Back (**BK-10**).                        | UX clara; estado de “cerrado” visible.                                                                     | **Pendiente** | —                              |
| **CL-5**  | (Opcional MVP+) Visor de documentos.                                                                | Alineado con README / diseño.                                                                              | **Pendiente** | [README.md](../../README.md)   |

---

## Flujo MVP (checklist de integración)

1. **Inicio**: Cliente envía identificador → Back resuelve paciente (tras **BK-2**, **ID-1**) → Back consulta Cerebro (**BK-8**, **CR-1**).
2. **Sin datos**: Cerebro sin fuentes → Back responde mensaje de bienvenida / sin datos médicos (**BK-9**).
3. **Con datos**: Respuestas con `sources` en cada turno (**BK-8**, **CR-4**).
4. **Cierre**: Resumen → ingestión en Cerebro → reindex o índice nuevo (**BK-10**, **CR-2**, **CR-3**).
5. **Trazabilidad**: Audit automático en pasos críticos (**BK-11**).

---

## Relación con [docs/06-backlog.md](../06-backlog.md)

El documento `06-backlog.md` agrupa por **sprints** (alto nivel). Este archivo desglosa **tareas comprobables** y estado frente al código; ambos deben mantenerse coherentes al cerrar sprints.
