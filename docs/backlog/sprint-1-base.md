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

### S1-02: Agregar identificador clínico al paciente (DNI/SSN) — TODO
- Agregar campo `identifier` (DNI o Número de Seguridad Social) al schema `Patient`
- Agregar campo `identifierType` (`dni` | `ssn` | `other`)
- Índice único compuesto `(tenantId, identifierType, identifier)`
- Actualizar `CreatePatientDto` con validación de identifier
- Endpoint `GET /patients/by-identifier?type=dni&value=12345678` para búsqueda por DNI/SSN
- **Prioridad:** Alta — es el flujo de inicio de chat (médico introduce DNI)
- **Criterio de aceptación:** Puedo buscar un paciente por DNI y obtenerlo o saber que no existe

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

### S1-06: Modelo ClinicalHistory — TODO
- Crear schema `ClinicalHistory` con: `tenantId`, `patientId`, `openedBy` (userId del doctor), `title`, timestamps
- CRUD: `POST /patients/:patientId/clinical-histories`, `GET /patients/:patientId/clinical-histories`, `GET /clinical-histories/:id`
- Índice `(tenantId, patientId)`
- Validar que el paciente exista antes de crear historia
- **Puede ser módulo nuevo** `modules/clinical-histories/` o sub-recurso de patients
- **Criterio de aceptación:** Puedo crear y listar historias clínicas de un paciente

### S1-07: Modelo ChatSummary — TODO
- Crear schema `ChatSummary` con: `tenantId`, `patientId`, `clinicalHistoryId`, `label` (ej. "Chat 1"), `summaryText`, `sessionId` (referencia a ChatSession)
- CRUD: `GET /clinical-histories/:id/chat-summaries`, `POST /clinical-histories/:id/chat-summaries`
- Este modelo vive en MongoDB (no en el corpus RAG)
- **Depende de:** S1-06 (ClinicalHistory)
- **Criterio de aceptación:** Puedo crear y listar resúmenes asociados a una historia clínica

### S1-08: Auth básica (JWT o similar) — TODO
- Implementar autenticación básica en `modules/auth/`
- El servicio está vacío actualmente — definir estrategia: JWT local, API key, o headers temporales
- Mínimo MVP: validar que las headers `x-tenant-id` y `x-doctor-user-id` sean válidas
- Guardar usuario autenticado en contexto de request
- **Decisión pendiente:** ¿JWT con registro de usuarios o simple API key por tenant?
- **Criterio de aceptación:** Los endpoints protegidos rechazan requests sin credenciales válidas

### S1-09: RAG Service — conexión base con Brain Service — TODO
- Implementar `RagService` (actualmente vacío) con HttpModule de NestJS
- Método `query(tenantId, patientId, clinicalHistoryId, query, scopes)` → llama a `POST /query` del Brain Service
- Método `healthCheck()` → verificar conexión con Brain Service
- Configurar `BRAIN_SERVICE_URL` desde ConfigService
- Manejar errores de conexión y timeouts
- **Archivo:** `modules/rag/rag.service.ts`
- **Criterio de aceptación:** Puedo hacer una query al Brain Service y recibir respuesta con fuentes

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
