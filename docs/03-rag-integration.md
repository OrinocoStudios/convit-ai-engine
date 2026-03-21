# RAG Integration

## Rol
Brain Service gestiona el **corpus RAG** (ingesta, embeddings, grafo, búsqueda).  
Los **resúmenes de los “Chat N”** (por historia clínica) viven en **otra base de datos**; el backend puede combinar ambos antes o durante la llamada al LLM, manteniendo trazabilidad en `sources`.

Convit AI orquesta y valida; no inventa respuestas sin fuentes.

## Ámbitos de recuperación (`scope`)

| Ámbito | Descripción | `patientId` |
|--------|-------------|---------------|
| `GLOBAL_LIBRARY` | PDFs médicos compartidos en el tenant | No aplica (solo `tenantId`) |
| `PATIENT_DOCUMENT` | Documentos del paciente; puede incluir recuperación vía tool call para archivos pequeños | Obligatorio |
| `CLINICAL_HISTORY` | Contexto acotado a una historia clínica; puede combinar corpus + resúmenes desde la DB de chats | Obligatorio + `clinicalHistoryId` |

## Endpoint (evolutivo)
`POST /query` (Brain Service) — el contrato debe permitir discriminar ámbito y, si aplica, historia clínica.

### Request (referencia)
```json
{
  "query": "texto",
  "tenantId": "hospital_1",
  "patientId": "123",
  "clinicalHistoryId": "hist_456",
  "scopes": ["GLOBAL_LIBRARY", "PATIENT_DOCUMENT", "CLINICAL_HISTORY"]
}
```

- Para consultas **solo biblioteca global**: omitir `patientId` o acordar semántica explícita (`patientId: null`) según implementación del Brain Service.
- Para consultas **dentro de una historia**: incluir `clinicalHistoryId` y los `scopes` necesarios.

### Response
```json
{
  "answer": "...",
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

Los ítems con `scope: CHAT_SUMMARY` pueden materializarse en el backend a partir de la **DB de resúmenes** y unificarse en el mismo formato para la UI, o venir ya fusionados si Brain Service y esa DB se integran en un solo servicio.

## Resúmenes de chat (“Chat N”)
- No son obligatoriamente chunks del mismo índice que los PDFs globales.
- Se persisten como **resúmenes** ligados a `tenantId`, `patientId`, `clinicalHistoryId`.
- El producto puede mostrar “Chat 1 / Chat 2” como etiquetas; el identificador estable es el de la fila/registro de resumen.

## Documentos pequeños y tool calls
Los archivos de bajo volumen asociados al paciente pueden exponerse al modelo mediante **tool calls** (lectura bajo demanda) además o en lugar de indexación masiva. Las reglas de tamaño y formato deben documentarse en el módulo de documentos.

## Reglas
- `sources` obligatorio para respuestas citables al usuario
- Si no hay `sources` suficientes, no se presenta respuesta como hecho clínico
- `tenantId` obligatorio en toda llamada
- `patientId` obligatorio cuando el ámbito incluye datos de paciente
- Trazabilidad: global vs paciente vs resumen de historia debe reflejarse en `scope` / metadatos de fuente

## Fix obligatorio
Incluir en metadatos de ingestión y en chunks:
- `tenantId`
- `patientId` (si aplica)
- `scope` / tipo de corpus (global vs paciente)
- `clinicalHistoryId` solo para material asociado a una historia concreta cuando exista
