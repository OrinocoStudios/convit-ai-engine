# Contratos de integración MVP (Convit)

Referencia mínima para alinear `convit-ai-client` → `convit-ai-engine` y `engine` → `pinky` (Brain Service). **Auth de usuario queda fuera del MVP** (cabeceras `x-tenant-id` / `x-doctor-user-id` en el cliente hacia el engine).

## 1. Cliente → Engine (`VITE_ENGINE_URL`, por defecto `http://localhost:3000`)

| Área | Método + ruta | Cabeceras | Cuerpo / query |
|------|----------------|----------|----------------|
| Pacientes | `GET /patients` | `x-tenant-id`, `x-doctor-user-id` | — |
| | `GET /patients/:id` | idem | — |
| | `POST /patients` | idem | `{ name, dni?, ssn? }` |
| Documentos | `GET /documents?kind&patientId&category` | idem | query opcional |
| | `GET /documents/:id` | idem | — |
| | `POST /documents` multipart | idem (sin forzar `Content-Type`) | `kind`, `patientId`, `category`, `filename`, `file` |
| | `GET /documents/:id/file` (blob) | idem | — |
| Historias | `GET /clinical-histories?patientId=` | idem | — |
| | `POST /clinical-histories` | idem | `{ patientId, title }` |
| Chat | `POST /chat/sessions` | idem | `{ patientId, clinicalHistoryId? }` → `ChatSession` con `anonymousPublicId` |
| | `GET /chat/sessions/:anonymousPublicId/messages` | idem | — |
| | `POST /chat/sessions/:id/messages` | idem | `{ role, content, authorDoctorUserId? }` (usuario) |
| | `POST /chat/sessions/:id/close` | idem | — → `{ summary }` |

**Variables Vite (cliente):** `VITE_ENGINE_URL`, `VITE_TENANT_ID`, `VITE_DOCTOR_USER_ID` (ver `convit-ai-client/.env.example`).

## 2. Engine → Pinky (`BRAIN_SERVICE_URL`, por defecto `http://localhost:8081` o `http://brain-service:8081` en Docker)

| Operación | Método + ruta | Cabeceras Brain | Cuerpo relevante |
|-----------|----------------|-----------------|------------------|
| RAG | `POST /query` | `X-Tenant-Id` (si multi-tenant), `X-API-Key` (si `ENABLE_API_KEY_AUTH` en Pinky) | `{ query, libraryIds[], sessionId? }` |
| Resumen | `POST /summarize` | `X-Tenant-Id`, opcional `X-Library-Id` | `{ messages, sessionId?, tenantId?, libraryId? }` |
| Ingesta texto | `POST /documents/text` | `X-Tenant-Id`, `X-Library-Id` (ámbito) | `{ title?, rawText, metadata? }` |
| Subida | `POST /documents/upload` | idem (multipart) | `file`, `title?` |

**Library IDs (convención engine):** `global:<categoría>`, `patient:<patientId>:<categoría>`, `history:<clinicalHistoryId>:summary` (categorías clínicas según `CLINICAL_DOCUMENT_CATEGORIES`).

**Respuesta `POST /query` (Pinky):** `answer`, `sourcesUsed[]`, `fastContext[]` (chunks con `id`, `text`, `documentId?`, `title?`, `libraryId?`, `metadata?`), `truthFacts[]`, `prompt`, etc.

**Trazabilidad RAG en engine:** Fuentes visibles al cliente = mapeo de `fastContext` a documentos Mongo locales cuando `ragDocumentId` coincide; si no, se usa título, `libraryId` o `id` de chunk. Si `fastContext` está vacío y hay `truthFacts`, el engine genera fuentes sintéticas a partir del grafo (MVP).

## 3. Puertos locales típicos

| Servicio | Puerto |
|----------|--------|
| convit-ai-client (Vite) | 5173 |
| convit-ai-engine | 3000 |
| pinky (Brain) | 8081 |

## 4. Readiness

- `GET /health/ready` en el engine: Mongo **y** conectividad a `GET {BRAIN_SERVICE_URL}/health` (Pinky). Detalle de estado en cuerpo JSON.
- `GET /health` en Pinky: Neo4j + sonda del proveedor LLM (ver `pinky` HealthController).
