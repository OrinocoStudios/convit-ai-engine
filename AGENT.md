# Convit AI Engine – Agent Context

## Qué es este proyecto
Convit AI es una plataforma interna para hospitales que permite consultar información clínica de pacientes mediante IA. NO es un chatbot — es un sistema de acceso seguro, rápido y trazable a información clínica.

## Regla fundamental
> **"La IA no responde, la IA cita."**
> Toda respuesta generada por el sistema DEBE incluir fuentes. Si no hay fuentes, no se responde.

## Reglas críticas (NO NEGOCIABLES)
- La IA **NO toma decisiones clínicas**
- La IA **resume, organiza y cita** información existente
- Los datos **NO salen del entorno del hospital** (on-premise)
- Toda respuesta es **auditable y trazable**
- **NO inventar información** — si no hay contexto suficiente, decir que no hay datos
- Todo documento, chunk y query debe incluir **tenantId** y **patientId**
- **NO usar APIs externas** — todo corre local

## Arquitectura
- **Monolito modular** (NestJS) — NO microservicios
- **Brain Service** como servicio RAG externo (separado del backend)
- **Frontend** en Next.js

### Componentes
- **Backend (NestJS)**: Auth, control de acceso, auditoría, API REST
- **Brain Service**: Ingesta de documentos, embeddings, GraphRAG, LLM
- **Neo4j**: Grafo de relaciones clínicas
- **MongoDB**: Datos operacionales
- **Ollama**: Servidor LLM local (Qwen)

### Flujo principal
```
Usuario → Frontend → Backend → Brain Service → Backend → Frontend
```

El backend NUNCA accede al LLM directamente. Siempre pasa por Brain Service.

## Módulos del backend
```
/modules
  /auth          → Autenticación y autorización
  /patients      → Gestión de pacientes
  /documents     → Upload y listado de documentos
  /rag           → Integración con Brain Service
  /chat          → Endpoint de chat
  /audit         → Registro de auditoría
```

## Tech stack
- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js + React + TypeScript
- **Base de datos**: Neo4j (grafo) + MongoDB (operacional)
- **RAG**: Brain Service (servicio externo)
- **LLM**: Ollama con Qwen (local)
- **Infra**: Docker Compose

## Modelo de datos clave
Todas las entidades que manejan datos de pacientes DEBEN incluir `tenantId` y `patientId`:
- `Patient`: id, tenantId, name
- `Document`: id, tenantId, patientId, type
- `Chunk`: id, tenantId, patientId, documentId
- `Conversation`: id, patientId
- `Message`: id, conversationId, content
- `AuditLog`: id, patientId, action

## API del Brain Service
```
POST /query
{
  "query": "texto",
  "patientId": "123",
  "tenantId": "hospital_1"
}

Response:
{
  "answer": "...",
  "sources": []   ← OBLIGATORIO, si está vacío no se muestra respuesta
}
```

## Convenciones de código
- TypeScript estricto en todo el proyecto
- Cada módulo NestJS tiene: `*.module.ts`, `*.controller.ts`, `*.service.ts`
- DTOs con class-validator para validación
- Cada endpoint que toca datos de paciente requiere `patientId` y `tenantId`
- Nombres de archivos en kebab-case
- Clases en PascalCase
- Variables y funciones en camelCase
- Tests con Jest

## Seguridad
- Aislamiento por `tenantId` (hospital) y `patientId`
- Sin dependencias de servicios externos
- Deploy on-premise obligatorio
- Toda acción sobre datos de paciente se registra en audit log

## Documentación
Los documentos de diseño están en `/docs`:
- `00-overview.md` → Visión general y principios
- `01-architecture.md` → Arquitectura y componentes
- `02-e2e-flows.md` → Flujos end-to-end
- `03-rag-integration.md` → Integración con Brain Service
- `04-data-model.md` → Modelo de datos
- `05-api-contracts.md` → Contratos de API
- `06-backlog.md` → Plan de sprints
- `07-security.md` → Seguridad y aislamiento
- `08-deployment.md` → Deployment con Docker

## Skills
Los skills accionables para tareas específicas están en `/.skills/`:
- `nestjs-module.md` → Cómo crear un módulo NestJS en este proyecto
- `rag-integration.md` → Cómo integrar con Brain Service
- `security-isolation.md` → Reglas de aislamiento por tenant/paciente
- `api-endpoint.md` → Cómo crear un nuevo endpoint REST
- `data-model.md` → Cómo definir entidades siguiendo el patrón del proyecto

## Antes de escribir código
1. Lee este archivo completo
2. Consulta el doc relevante en `/docs` si necesitas más contexto
3. Sigue el skill correspondiente en `/.skills/` para la tarea
4. NUNCA generes respuestas de IA sin fuentes
5. SIEMPRE incluye tenantId y patientId donde corresponda
6. SIEMPRE registra en audit log las operaciones sobre datos de pacientes
