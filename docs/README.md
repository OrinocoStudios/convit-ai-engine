# Documentación del proyecto

Índice de diseño y operación de **convit-ai-engine** (backend NestJS en `backend/`).

## Fuente de verdad

| Qué | Dónde | Notas |
| --- | --- | --- |
| **Backlog técnico accionable** | [backlog-cursor/BACKLOG.md](./backlog-cursor/BACKLOG.md) | Estados Hecho/Pendiente; regla Cursor: actualizar [backlog-cursor/CHANGELOG.md](./backlog-cursor/CHANGELOG.md) en el mismo cambio. |
| **Changelog del backlog técnico** | [backlog-cursor/CHANGELOG.md](./backlog-cursor/CHANGELOG.md) | Historial de cambios de esa carpeta (no sustituye release SemVer del artefacto). |
| **Changelog por sprints (histórico)** | [backlog/CHANGELOG.md](./backlog/CHANGELOG.md) | Referencia por sprint; usar cuando se actualicen tareas en `docs/backlog/sprint-*.md`. |
| **Decisiones de arquitectura** | [adr/](./adr/) | ADR numerados. |
| **Cambios técnicos recientes** | [technical-changelog.md](./technical-changelog.md) | Registro orientado a ingeniería. |

## Diseño numerado (`docs/00`–`08`)

| Doc | Contenido |
| --- | --- |
| [00-overview.md](./00-overview.md) | Visión y principios |
| [01-architecture.md](./01-architecture.md) | Arquitectura |
| [02-e2e-flows.md](./02-e2e-flows.md) | Flujos E2E |
| [03-rag-integration.md](./03-rag-integration.md) | Brain Service / RAG |
| [04-data-model.md](./04-data-model.md) | Modelo de datos |
| [05-api-contracts.md](./05-api-contracts.md) | Contratos API REST |
| [06-backlog.md](./06-backlog.md) | Resumen obsoleto → enlaza a `backlog-cursor/` |
| [07-security.md](./07-security.md) | Seguridad |
| [08-deployment.md](./08-deployment.md) | Despliegue |

## Onboarding y operación

- [getting-started.md](./getting-started.md) — arranque local, tests, Docker.
- [observability-roadmap.md](./observability-roadmap.md) — plan por fases (logs, métricas, trazas).
- [runbooks/](./runbooks/) — procedimientos operativos breves.

## Contexto para agentes / equipo

- Raíz del repo: [AGENT.md](../AGENT.md) — reglas de producto y convenciones de código.
