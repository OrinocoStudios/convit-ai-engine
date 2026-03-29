# API Contracts

Convención general: salvo rutas de health, los endpoints de dominio suelen requerir cabecera **`x-tenant-id`**. Donde se indique, también **`x-doctor-user-id`** (MVP hasta JWT u OIDC — ver [07-security.md](./07-security.md)).

## Health (sin autenticación)

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Liveness: el proceso responde. |
| `GET` | `/health/ready` | Readiness: MongoDB conectado (`503` si no). |

## Chat y RAG

La consulta RAG integrada en el flujo de chat se dispara al **añadir un mensaje de usuario** a la sesión (no existe un `POST /chat` separado en la implementación actual).

Cabeceras para sesiones: `x-tenant-id`, `x-doctor-user-id` (crear sesión).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/chat/sessions` | Crea sesión. Cuerpo: `patientId`, `clinicalHistoryId?`, `additionalDoctorUserIds?`. Respuesta anónima: `anonymousPublicId`, `doctorUserIds`, `primaryDoctorUserId` (sin `patientId`). |
| `GET` | `/chat/sessions/:anonymousPublicId` | Metadatos de sesión. |
| `GET` | `/chat/sessions/:anonymousPublicId/messages` | Lista mensajes con `id`, `role`, `content`, timestamps y `sources[]?` en respuestas del asistente para trazabilidad UI. |
| `POST` | `/chat/sessions/:anonymousPublicId/messages` | Añade mensaje. Cuerpo: `content`, `role`, `authorDoctorUserId?` (obligatorio si `role === user`). Si `role === user`, el backend orquesta la llamada al Brain, persiste la respuesta del asistente y deja las fuentes accesibles por `GET /messages`. |
| `POST` | `/chat/sessions/:anonymousPublicId/close` | Cierra sesión (resumen / reindexación según lógica del servicio). |

### Proxy directo al Brain (uso interno / depuración)

Expone el contrato HTTP hacia Pinky. **No está protegido por cabeceras en el código actual**; en producción restrinja por red o autenticación.

| Método | Ruta | Cuerpo (JSON) |
| --- | --- | --- |
| `POST` | `/rag/query` | `query`, `tenantId`, `patientId?`, `clinicalHistoryId?`, `scopes?` (`GLOBAL_LIBRARY` \| `PATIENT_DOCUMENT` \| `CLINICAL_HISTORY`) |
Respuesta: `answer` y `sources[]`, donde cada fuente puede incluir `documentId`, `source`, `scope` y metadata clínica (`category`, `filename`, `ragDocumentId`, `ragLibraryId`).
Respuesta: la devuelve el Brain (p. ej. `answer`, `sources`).

## Documentos (metadatos en MongoDB)

Cabeceras: `x-tenant-id`, `x-doctor-user-id` (`uploadedBy`).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/documents` | `multipart/form-data` con `file?`, `kind` (`global_library` \| `patient`), `patientId` (obligatorio si `kind === patient`), `category` (`medical_history` \| `medical_consultation`), `filename`, `storageKey?`, `mimeType?`. Si llega `file`, el engine guarda el original, extrae texto vía Pinky y persiste referencias de trazabilidad. |
| `GET` | `/documents?kind=&patientId=&category=` | Listado filtrado por ámbito, paciente y categoría clínica. |
| `GET` | `/documents/:id` | Detalle documental con metadata clínica y `extractedText`. |
| `GET` | `/documents/:id/file` | Descarga o visualización inline del archivo original. Registra auditoría de acceso. |

## Pacientes

Cabecera: `x-tenant-id`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/patients` | Cuerpo: `name`, `dni?`, `ssn?` — **al menos uno** de `dni` o `ssn` requerido por reglas de negocio. |
| `GET` | `/patients` | Lista por tenant. |
| `GET` | `/patients/search?identity=` | Busca por valor de DNI o SSN en el tenant. |
| `GET` | `/patients/:id` | Detalle por `patientId` (ObjectId). |

## Historias clínicas

Cabeceras: `x-tenant-id`, `x-doctor-user-id` en `POST`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/clinical-histories` | Cuerpo: `patientId`, `title`. |
| `GET` | `/clinical-histories?patientId=` | Lista por paciente. |
| `GET` | `/clinical-histories/:id` | Detalle. |

## Resúmenes “Chat N” (`chat-summaries`)

Cabeceras: `x-tenant-id`, `x-doctor-user-id` en `POST`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/chat-summaries` | Crea resumen (DTO según módulo). |
| `GET` | `/chat-summaries?clinicalHistoryId=` o `?patientId=` | Lista por historia o por paciente (uno de los dos query params obligatorio). |

## Auditoría

Cabeceras: `x-tenant-id`; `x-doctor-user-id` opcional en `POST /audit/logs`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/audit` | Listado de logs del tenant. |
| `POST` | `/audit/logs` | Cuerpo: `action`, `patientId?`, `clinicalHistoryId?`, `metadata?`. |

## Chat solo biblioteca global (diseño / futuro)

`POST /chat/global` o similar **no está implementado** en el backend actual; el ámbito global se selecciona vía `scopes` en la consulta RAG cuando el flujo lo permita.
