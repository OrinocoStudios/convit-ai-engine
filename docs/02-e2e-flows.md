# Flujos E2E

## Chat dentro de una historia clínica
Frontend → Backend (valida tenant, paciente, `clinicalHistoryId`) →  
carga resúmenes “Chat N” desde **DB de conversaciones** + opcionalmente Brain Service (`/query` con scopes) →  
Backend → Frontend (respuesta + fuentes con `scope` discriminado)

## Chat / consulta solo biblioteca global
Frontend → Backend → Brain Service con `scope: GLOBAL_LIBRARY` (sin `patientId` según contrato) → Frontend

## Upload — biblioteca RAG global
Frontend → Backend → Brain Service (ingesta corpus global) → registro `GlobalLibraryDocument` → Frontend

## Upload — documento de paciente
Frontend → Backend → Brain Service y/o registro para tool calls → `PatientDocument` → Frontend

## Búsqueda
Frontend → Backend → Brain Service y/o índice documental filtrado por tenant + (paciente | global)

## Creación / actualización de resumen “Chat N”
Tras una conversación o al guardar explícito: Backend → **DB de resúmenes** (`ChatSummary` ligado a `clinicalHistoryId`)
