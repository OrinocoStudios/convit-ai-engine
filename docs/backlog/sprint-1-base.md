# Sprint 1 – Base: Auth, Pacientes, Historias Clínicas, RAG Base

**Estado:** EN PROGRESO (parcialmente completado)

## Objetivo
Implementar la capa de datos operacionales completa: autenticación básica, gestión de pacientes con identificador clínico, modelo de historias clínicas, y conexión base con Brain Service.

---

## Tareas

### S1-01: Patient CRUD con aislamiento por tenantId — DONE
- Schema `Patient` con `tenantId`, `name`, timestamps
- Índice compuesto `(tenantId, name)`
- `POST /patients`, `GET /patients`, `GET /patients/:id`
- Header `x-tenant-id` obligatorio en todos los endpoints
- DTO `CreatePatientDto` con validación
- **Archivos:** `modules/patients/`

### S1-02: Identificador clínico al paciente (DNI/SSN) — DONE
- Schema `Patient`: campos `dni` y `ssn` con índices únicos parciales por `tenantId`
- `CreatePatientDto`: al menos uno de `dni` / `ssn` (validación en servicio)
- Búsqueda: `GET /patients/search?identity=<valor>` (coincide con DNI o SSN en el tenant)
- Referencia: [docs/adr/0001-patient-identifier-dni-ssn.md](../adr/0001-patient-identifier-dni-ssn.md)

### S1-03: Documents metadata CRUD — DONE
- Schema `ClinicalDocument` con `tenantId`, `kind` (global_library | patient), `patientId`, `uploadedBy`, `filename`, `storageKey`, `mimeType`
- Validación: `patientId` obligatorio si kind=patient, prohibido si kind=global_library
- `POST /documents`, `GET /documents?kind=&patientId=`
- Headers: `x-tenant-id`, `x-doctor-user-id`
- **Archivos:** `modules/documents/`

### S1-04: Chat sessions y messages (persistencia anónima) — DONE
- Schema `ChatSession` con `anonymousPublicId` (UUID), `doctorUserIds`, `primaryDoctorUserId`, `patientId` (interno), `clinicalHistoryId`
- Schema `ChatMessage` con roles, `authorDoctorUserId`
- CRUD: crear sesión, obtener sesión, listar mensajes, agregar mensaje
- patientId NO se expone en respuestas públicas
- **Archivos:** `modules/chat/`

### S1-05: AuditLog schema y servicio — DONE
- Schema `AuditLog` con `tenantId`, `action`, `patientId`, `clinicalHistoryId`, `userId`, `metadata`
- Método `log()` para escritura
- **Archivos:** `modules/audit/`

### S1-06: Modelo ClinicalHistory — DONE
- Módulo `modules/clinical-histories/` con rutas bajo `/clinical-histories` (no como sub-recurso de `/patients/:id/...` en la implementación actual)
- `POST /clinical-histories`, `GET /clinical-histories?patientId=`, `GET /clinical-histories/:id`

### S1-07: Modelo ChatSummary — DONE
- Módulo `chat-summaries`: `POST /chat-summaries`, `GET /chat-summaries?clinicalHistoryId=` o `?patientId=`
- Persistencia en MongoDB (no corpus RAG)

### S1-08: Auth básica (JWT o similar) — TODO
- Implementar autenticación básica en `modules/auth/`
- El servicio está vacío actualmente — definir estrategia: JWT local, API key, o headers temporales
- Mínimo MVP: validar que las headers `x-tenant-id` y `x-doctor-user-id` sean válidas
- Guardar usuario autenticado en contexto de request
- **Decisión pendiente:** ¿JWT con registro de usuarios o simple API key por tenant?
- **Criterio de aceptación:** Los endpoints protegidos rechazan requests sin credenciales válidas

### S1-09: RAG Service — conexión base con Brain Service — DONE
- `RagService` + `POST /rag/query` (proxy); configuración `BRAIN_SERVICE_URL`
- **Pendiente mejora:** `healthCheck()` dedicado y restringir `/rag/query` en producción (ver [docs/07-security.md](../07-security.md))

### S1-10: Tests de integración para módulos nuevos — TODO
- Tests de integración para ClinicalHistory CRUD
- Tests de integración para ChatSummary CRUD
- Tests de integración para búsqueda de paciente por identifier
- Usar el helper existente `createTestingApp()` + mongodb-memory-server
- **Depende de:** S1-02, S1-06, S1-07

---

## Dependencias
- Brain Service (Pinky) debe estar corriendo para S1-09
- Decisión sobre estrategia de auth para S1-08
