# API Contracts

## Chat RAG (consulta con IA — Brain Service)
`POST /chat` *(contrato orientado a RAG; ver `docs/03-rag-integration.md`)*

```json
{
  "patientId": "123",
  "clinicalHistoryId": "hist_456",
  "query": "texto",
  "scopes": ["GLOBAL_LIBRARY", "PATIENT_DOCUMENT", "CLINICAL_HISTORY"]
}
```

## Persistencia de chat en MongoDB (sesión anónima + médicos)
Cabeceras: `x-tenant-id`, `x-doctor-user-id` (hasta integrar JWT).

`POST /chat/sessions` — crea sesión; cuerpo: `patientId`, `clinicalHistoryId?`, `additionalDoctorUserIds?`. Respuesta **sin** `patientId`: incluye `anonymousPublicId` (UUID) y `doctorUserIds` / `primaryDoctorUserId`.

`GET /chat/sessions/:anonymousPublicId` — metadatos de sesión (vista anónima).

`GET /chat/sessions/:anonymousPublicId/messages` — mensajes (rol, contenido, `authorDoctorUserId` si aplica).

`POST /chat/sessions/:anonymousPublicId/messages` — cuerpo: `content`, `role`, `authorDoctorUserId?` (obligatorio si `role === user`).

## Chat / consulta solo biblioteca global (opcional)
`POST /chat/global` o `POST /query/global` (definir ruta única en implementación)

```json
{
  "query": "texto"
}
```

`tenantId` desde token; sin `patientId`.

## Documentos

`POST /documents/upload` — body debe discriminar:
- upload a **biblioteca global** (sin `patientId`) o
- upload a **paciente** (`patientId` requerido)

`GET /documents?patientId=123` — documentos del paciente  
`GET /documents/global` — biblioteca del tenant (según implementación)

## Pacientes

`GET /patients`  
`GET /patients/:id`

## Historias clínicas (referencia)

`GET /patients/:patientId/clinical-histories`  
`POST /patients/:patientId/clinical-histories`  
`GET /clinical-histories/:id`

## Resúmenes “Chat N”

`GET /clinical-histories/:id/chat-summaries`  
`POST /clinical-histories/:id/chat-summaries` (crear o regenerar resumen)

Las rutas exactas pueden ajustarse; lo crítico es el contrato de datos (`tenantId`, `patientId`, `clinicalHistoryId`).
