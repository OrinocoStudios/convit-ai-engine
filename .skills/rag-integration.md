# Skill: Integración con Brain Service

## Cuándo usar
Cuando necesites enviar queries al Brain Service, ingestar documentos (biblioteca global o paciente), o componer contexto junto con **resúmenes de chat** desde la otra DB.

## Principio
El backend de Convit AI **NO accede al LLM directamente** para el corpus RAG. Toda interacción con el índice principal pasa por Brain Service. Los **resúmenes “Chat N”** pueden leerse desde la **DB de conversaciones** y fusionarse en la respuesta con el mismo formato de fuentes.

## Arquitectura
```
Backend (NestJS) → HTTP → Brain Service → (grafo / embeddings / vector store / LLM internos al Brain Service)
Backend (NestJS) → DB resúmenes → (fusión de contexto / sources)
```

## Ámbitos
- `GLOBAL_LIBRARY` — PDFs del tenant, sin paciente
- `PATIENT_DOCUMENT` — documentos del paciente (chunks / tool calls según política)
- `CLINICAL_HISTORY` — contexto de historia; a menudo combina corpus + resúmenes persistidos

## Endpoint principal: Query
```
POST {BRAIN_SERVICE_URL}/query

Request (referencia):
{
  "query": "string",
  "tenantId": "string",           ← OBLIGATORIO
  "patientId": "string",          ← obligatorio si scopes incluyen paciente
  "clinicalHistoryId": "string",  ← si la consulta es por historia
  "scopes": ["GLOBAL_LIBRARY", "PATIENT_DOCUMENT", "CLINICAL_HISTORY"]
}

Response:
{
  "answer": "string",
  "sources": [
    {
      "content": "string",
      "source": "string",
      "documentId": "string",
      "scope": "GLOBAL_LIBRARY | PATIENT_DOCUMENT | CHAT_SUMMARY"
    }
  ]
}
```

## Reglas críticas
1. **NUNCA** enviar query sin `tenantId`
2. Incluir `patientId` cuando el ámbito no sea solo biblioteca global
3. **NUNCA** mostrar `answer` al usuario si no hay fuentes válidas para la política de producto
4. Si Brain Service no responde o falla, retornar error claro — NO inventar respuesta
5. Toda query debe registrarse en **audit log** (incl. `clinicalHistoryId` si aplica)
6. Resúmenes desde la otra DB deben etiquetarse como `scope: CHAT_SUMMARY` al unificar `sources`

## Implementación en el backend
El módulo `/rag` es el punto de contacto con Brain Service; la **fusión con resúmenes** puede vivir en `ChatService` o un servicio dedicado que llame a `RagService` y al repositorio de resúmenes.

```typescript
// rag.service.ts — esquema ilustrativo
@Injectable()
export class RagService {
  async query(dto: RagQueryDto): Promise<RagResponseDto> {
    const response = await this.httpService.axiosRef.post(
      `${this.brainServiceUrl}/query`,
      {
        query: dto.query,
        tenantId: dto.tenantId,
        patientId: dto.patientId,
        clinicalHistoryId: dto.clinicalHistoryId,
        scopes: dto.scopes,
      },
    );

    if (!response.data.sources?.length) {
      throw new Error('Brain Service returned no sources');
    }

    return response.data;
  }
}
```

## Otros módulos NO deben
- Llamar a Brain Service directamente (salvo el contrato explícito que centralice en `RagService`)
- Generar respuestas de IA por su cuenta sin fuentes

## Flujo completo de un chat por historia
1. `ChatController` recibe `patientId`, `clinicalHistoryId`, `query`, `scopes`
2. `ChatService` carga resúmenes “Chat N” si `CLINICAL_HISTORY` está activo
3. `RagService.query()` llama a Brain Service con los mismos límites de ámbito
4. Se unifican fuentes (corpus + `CHAT_SUMMARY`); se valida política de citas
5. Se persiste mensaje / audit según diseño
6. Respuesta al cliente con `answer` + `sources` discriminados

## Variables de entorno requeridas
```
BRAIN_SERVICE_URL=http://brain-service:3001
```
