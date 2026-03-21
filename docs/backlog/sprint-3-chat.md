# Sprint 3 – Chat RAG: LLM, Resúmenes y Reindexación

**Estado:** TODO

## Objetivo
Implementar el flujo completo de chat con IA: consulta RAG por paciente/historia, integración con LLM, generación de resúmenes al cerrar chat, y reindexación del paciente.

---

## Tareas

### S3-01: Endpoint POST /chat — consulta RAG completa — TODO
- Endpoint `POST /chat` que orquesta todo el flujo:
  1. Recibe `patientId`, `clinicalHistoryId`, `query`, `scopes`
  2. Consulta al Brain Service vía RagService (`POST /query`)
  3. Opcionalmente inyecta resúmenes de chat (ChatSummary) como contexto adicional
  4. Devuelve respuesta + fuentes con scope trazable (GLOBAL_LIBRARY, PATIENT_DOCUMENT, CHAT_SUMMARY)
- Headers: `x-tenant-id`, `x-doctor-user-id`
- Si el paciente NO tiene datos: responder "Bienvenida al nuevo paciente. Aún no tenemos datos médicos."
- Si el paciente SÍ tiene datos: responder con contexto clínico
- **NO responder sin fuentes** — si no hay contexto suficiente, indicarlo explícitamente
- **Depende de:** S1-09 (RAG Service), S1-07 (ChatSummary)
- **Criterio de aceptación:** Puedo hacer una pregunta sobre un paciente y recibir respuesta con fuentes

### S3-02: Flujo inicio de chat por identificador — TODO
- Cuando el médico introduce el DNI/SSN del paciente:
  1. Frontend envía el identificador al backend
  2. Backend busca paciente por identifier (S1-02)
  3. Si no existe → crear paciente nuevo + responder bienvenida
  4. Si existe → consultar Brain Service por contexto inicial
  5. Iniciar ChatSession automáticamente
- Endpoint: `POST /chat/start` con `{ identifier, identifierType, clinicalHistoryId? }`
- **Depende de:** S1-02 (identifier), S1-04 (ChatSession), S3-01
- **Criterio de aceptación:** Puedo iniciar un chat con DNI y el sistema responde apropiadamente

### S3-03: Persistir mensajes en flujo de chat — TODO
- Cada pregunta del usuario y respuesta del asistente se guardan como ChatMessage
- El campo `sources` de la respuesta se guarda en metadata del mensaje assistant
- Integrar con ChatSession existente (S1-04)
- **Depende de:** S3-01, S1-04
- **Criterio de aceptación:** Los mensajes de una conversación se persisten y puedo consultarlos

### S3-04: Consulta solo biblioteca global (sin paciente) — TODO
- Endpoint `POST /chat/global` — consulta RAG solo scope GLOBAL_LIBRARY
- No requiere `patientId`
- Solo `tenantId` desde headers
- Para consultas genéricas de protocolos, guías, etc.
- **Depende de:** S1-09
- **Criterio de aceptación:** Puedo hacer preguntas sobre protocolos sin necesidad de seleccionar paciente

### S3-05: Generación de resumen al cerrar chat — TODO
- Cuando se cierra una sesión de chat (`POST /chat/sessions/:id/close`):
  1. Obtener todos los mensajes de la sesión
  2. Generar resumen usando el LLM (vía Brain Service o Ollama directo)
  3. Crear ChatSummary asociado a la historia clínica
  4. Marcar sesión como cerrada (`status: 'closed'`)
- Agregar campo `status` al schema ChatSession (`active`, `closed`)
- **Depende de:** S1-04, S1-07, S3-03
- **Criterio de aceptación:** Al cerrar un chat, se genera un resumen automático que queda asociado a la historia

### S3-06: Reindexar paciente tras cierre de chat — TODO
- Después de generar el resumen (S3-05):
  1. Enviar el resumen al Brain Service como nuevo documento del paciente
  2. Si el paciente ya tiene historial indexado → reindexar incrementalmente
  3. Si el paciente es nuevo → crear índice desde cero
- Llamar a `POST /index/incremental` o `POST /index/rebuild` del Brain Service
- Manejar errores de reindexación
- **Depende de:** S3-05, S1-09
- **Criterio de aceptación:** Después de cerrar un chat, futuras consultas sobre el paciente incluyen información del chat previo

### S3-07: Fusión de fuentes (corpus + resúmenes) — TODO
- Las respuestas del chat deben incluir fuentes de todos los orígenes:
  - `GLOBAL_LIBRARY` → documentos de la biblioteca global
  - `PATIENT_DOCUMENT` → documentos del paciente
  - `CHAT_SUMMARY` → resúmenes de chats anteriores
- El backend debe fusionar fuentes del Brain Service con resúmenes de la DB local
- Mantener formato uniforme en `sources[]` para el frontend
- **Depende de:** S3-01, S1-07
- **Criterio de aceptación:** Las fuentes muestran claramente de dónde viene cada pieza de información

### S3-08: Tests de integración para chat RAG — TODO
- Test flujo completo: inicio de chat → pregunta → respuesta con fuentes
- Test paciente nuevo (bienvenida)
- Test cierre de chat + generación de resumen
- Mock del Brain Service
- **Depende de:** S3-01 a S3-06

---

## Dependencias
- Sprint 1 completo (especialmente S1-02, S1-06, S1-07, S1-09)
- Sprint 2 completo (documentos indexados en Brain Service)
- Brain Service debe soportar query con scopes y respuesta con fuentes
- Ollama corriendo con modelo Qwen para generación de resúmenes
