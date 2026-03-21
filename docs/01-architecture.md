# Arquitectura

## Enfoque
- Monolito modular (NestJS)
- Brain Service como RAG externo
- Dos familias de almacenamiento de contexto conversacional:
  - **Corpus RAG** (embeddings / grafo / chunks): biblioteca global + documentación de paciente según diseño
  - **Base de resúmenes de chat**: conversaciones y resúmenes ligados a **historia clínica** (los “Chat N” de producto)

## Componentes
- Frontend (Next.js)
- Backend (NestJS) + **MongoDB** (única BD de este servicio: operacional + chats persistidos)
- Brain Service (externo: corpus RAG, embeddings, grafo/relaciones si aplica, vector store)
- DB de **threads / resúmenes de chat** puede ser la misma Mongo del backend u otro store según producto
- LLM local

## Jerarquía lógica del conocimiento (por clínica)

```
Clínica (tenant)
├── Biblioteca RAG global — PDFs compartidos
└── Pacientes
    └── Paciente
        ├── Documentos (pequeños; accesibles vía tool call)
        └── Historias clínicas
            └── Historia
                └── “Chat N” → resúmenes persistidos en DB de conversaciones
```

## Responsabilidades

Backend:
- Auth
- Control de acceso por tenant, paciente e historia clínica
- Auditoría
- Orquestación de queries con **ámbito** (global vs paciente vs historia)

Brain Service:
- Ingesta al corpus RAG (global y/o paciente)
- Embeddings, GraphRAG según diseño
- Query con restricción de ámbito y devolución de `sources`

Almacenamiento de resúmenes:
- CRUD de resúmenes / metadatos de “Chat N”
- Lectura para inyectar contexto en el hilo de la historia sin mezclar tenants ni pacientes
