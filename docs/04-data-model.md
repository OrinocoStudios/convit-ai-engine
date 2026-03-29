# Modelo de datos

## Convención
- **`tenantId`**: clínica / hospital (aislamiento entre organizaciones).
- **`patientId`**: obligatorio en entidades con datos clínicos por persona; la **biblioteca global** usa solo `tenantId` (sin paciente).
- **`clinicalHistoryId`**: historia clínica bajo un paciente; agrupa el hilo asistencial y los “Chat N” como resúmenes.

## Entidades principales (lógicas)

### Tenant / Clínica
- Identificador de organización para todo el aislamiento multi-hospital.

### Patient (colección `patients`)
- `_id` — usado como **`patientId`** en APIs y relaciones internas.
- `tenantId` — clínica (índices y unicidad por tenant).
- `name`
- `dni` — documento nacional u homólogo (opcional en esquema; **al menos uno** de `dni` / `ssn` al crear, validado en servicio).
- `ssn` — número de seguridad social u homólogo (igual que `dni` respecto a obligatoriedad).
- Índices únicos parciales: `(tenantId, dni)` y `(tenantId, ssn)` cuando el campo está definido.
- `createdAt`, `updatedAt` — timestamps (`timestamps: true` en Mongoose).

Ver decisión en [adr/0001-patient-identifier-dni-ssn.md](./adr/0001-patient-identifier-dni-ssn.md).

### GlobalLibraryDocument
- id
- tenantId
- uploadedBy (userId del doctor)
- type, storage key, etc.
- **Sin** `patientId` — corpus compartido en el tenant

### PatientDocument
- id
- tenantId
- patientId
- flags: p. ej. `smallFile`, `toolCallable` según política
- type, storage key

### ClinicalHistory
- id
- tenantId
- patientId
- openedBy (userId del doctor que abre la historia, ej. “Dr. García”)
- título o etiqueta visible
- timestamps

### ChatSummary (persistido en DB de conversaciones / resúmenes)
Almacenado **fuera** del corpus vectorial principal o referenciado desde él según implementación.
- id
- tenantId
- patientId
- clinicalHistoryId
- label UI (ej. “Chat 1”) — no sustituye al id estable
- summaryText o referencia a artefactos
- vínculo opcional al thread conversacional completo en la misma u otra tabla

### ChatSession (MongoDB — registro anónimo hacia fuera)
Colección `chat_sessions`. Identidad pública **`anonymousPublicId`** (UUID v4); no se expone `patientId` en las respuestas “anónimas” de API.
- tenantId
- anonymousPublicId (único por tenant)
- doctorUserIds[] — relación explícita con médicos (user ids del sistema de auth)
- primaryDoctorUserId — médico que abrió la sesión (debe estar en `doctorUserIds`)
- patientId — solo uso interno / aislamiento; no devolver en endpoints públicos anónimos
- clinicalHistoryId (opcional)

### ChatMessage (MongoDB)
Colección `chat_messages`.
- tenantId
- sessionId → ChatSession
- sessionAnonymousPublicId (denormalizado)
- role: `user` | `assistant` | `system`
- content
- authorDoctorUserId (opcional; obligatorio si `role === user` — qué médico escribió)

### Chunk (corpus RAG)
- id
- tenantId
- patientId (nullable si chunk es de biblioteca global)
- documentId
- scope: `GLOBAL_LIBRARY` | `PATIENT_DOCUMENT`
- clinicalHistoryId (opcional; solo si el diseño indexa material bajo historia)

### Conversation / Message (chat en vivo)
Implementado como **ChatSession** + **ChatMessage** (arriba). Las conversaciones largas pueden alimentar la generación de **ChatSummary** en la DB de resúmenes.

### AuditLog
- id
- tenantId
- patientId (si aplica)
- clinicalHistoryId (si aplica)
- action
- userId
- metadata (pregunta, scopes, ids de fuentes)

## Dos bases de datos (conceptual)
1. **Corpus RAG** (embeddings, grafo, vector store) — **Brain Service** u otro servicio externo; **operacional clínico** en este repo — **MongoDB** (pacientes, metadatos documentos, auditoría, sesiones de chat).
2. **Resúmenes / historial de conversación** por historia clínica — almacén separado para los “Chat N” y metadatos asociados.

La aplicación debe mantener **coherencia referencial** (`clinicalHistoryId`, `patientId`, `tenantId`) entre ambas.
