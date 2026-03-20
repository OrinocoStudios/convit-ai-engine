# RAG Integration

## Rol
Brain Service gestiona documentos, embeddings, grafo y queries.

Convit AI solo lo consume.

## Endpoint
POST /query

## Request
{
  "query": "texto",
  "patientId": "123",
  "tenantId": "hospital_1"
}

## Response
{
  "answer": "...",
  "sources": []
}

## Reglas
- sources obligatorio
- si no hay sources no se responde
- patientId obligatorio
- tenantId obligatorio

## Fix obligatorio
Añadir patientId y tenantId en:
- documents
- chunks
- queries
