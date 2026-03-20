# Skill: Integración con Brain Service

## Cuándo usar
Cuando necesites enviar queries al Brain Service, ingestar documentos, o consumir cualquier funcionalidad RAG.

## Principio
El backend de Convit AI **NO accede al LLM directamente**. Toda interacción con IA pasa por Brain Service.

## Arquitectura
```
Backend (NestJS) → HTTP → Brain Service → Neo4j / Embeddings / LLM
```

## Endpoint principal: Query
```
POST {BRAIN_SERVICE_URL}/query

Request:
{
  "query": "string",        ← pregunta del usuario
  "patientId": "string",    ← OBLIGATORIO
  "tenantId": "string"      ← OBLIGATORIO
}

Response:
{
  "answer": "string",
  "sources": [               ← OBLIGATORIO, array nunca vacío para respuestas válidas
    {
      "content": "string",
      "source": "string",
      "documentId": "string"
    }
  ]
}
```

## Reglas críticas
1. **NUNCA** enviar query sin `patientId` y `tenantId`
2. **NUNCA** mostrar `answer` al usuario si `sources` está vacío
3. Si Brain Service no responde o falla, retornar error claro — NO inventar respuesta
4. Toda query debe registrarse en **audit log**
5. El `answer` del Brain Service debe tratarse como **sugerencia citada**, no como verdad absoluta

## Implementación en el backend
El módulo `/rag` es el único punto de contacto con Brain Service:

```typescript
// rag.service.ts
@Injectable()
export class RagService {
  constructor(private readonly httpService: HttpService) {}

  async query(dto: RagQueryDto): Promise<RagResponseDto> {
    const response = await this.httpService.axiosRef.post(
      `${this.brainServiceUrl}/query`,
      {
        query: dto.query,
        patientId: dto.patientId,
        tenantId: dto.tenantId,
      },
    );

    // Validar que sources no esté vacío
    if (!response.data.sources?.length) {
      throw new Error('Brain Service returned no sources');
    }

    return response.data;
  }
}
```

## Otros módulos NO deben
- Llamar a Brain Service directamente
- Importar HttpService para hablar con Brain Service
- Generar respuestas de IA por su cuenta

## Flujo completo de un chat query
1. `ChatController` recibe request con `patientId` y `query`
2. `ChatService` llama a `RagService.query()`
3. `RagService` envía a Brain Service
4. Brain Service retorna `answer` + `sources`
5. `ChatService` valida sources, guarda en DB, registra audit
6. Retorna al usuario la respuesta con fuentes

## Variables de entorno requeridas
```
BRAIN_SERVICE_URL=http://brain-service:3001
```
