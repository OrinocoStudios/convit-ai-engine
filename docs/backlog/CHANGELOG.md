# Changelog – Convit AI Engine

> **REGLA:** Este archivo DEBE actualizarse cada vez que se complete una tarea del backlog,
> se haga un cambio arquitectónico, se agregue funcionalidad, o se corrija un bug.
> Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

### Changed

- Alineación de `docs/backlog/README.md` con `docs/backlog-cursor/` como backlog canónico con IDs.
- Actualizado `sprint-1-base.md` (S1-02, S1-06, S1-07, S1-09) al estado real del código.

### Added

- Entradas cruzadas a `docs/getting-started.md`, runbooks y ADR desde el índice `docs/README.md`.

---

## [0.0.1] – 2025-03-21

### Added
- **Sprint 0:** Scaffold NestJS en `backend/` con TypeScript estricto
- **Sprint 0:** 6 módulos base creados: auth, patients, documents, rag, chat, audit
- **Sprint 0:** ConfigModule global + ValidationPipe global
- **Sprint 0:** MongooseModule configurado con MONGO_URI
- **Sprint 0:** `.env.example` con PORT, MONGO_URI, BRAIN_SERVICE_URL
- **Sprint 0:** Dockerfile para backend + docker-compose.yml (backend, mongo)
- **Sprint 0:** `.gitignore` para Node.js/NestJS
- **Sprint 0:** Vitest configurado (unit + integration) con `unplugin-swc`
- **Sprint 0:** `mongodb-memory-server` para tests de integración
- **Sprint 0:** Helper reutilizable `test/helpers/integration-setup.ts`
- **Sprint 0:** Documentación completa: `docs/00` a `docs/08`, `AGENT.md`, `.skills/`
- **Sprint 1 (parcial):** Patient schema + CRUD (create, list, findOne) con aislamiento por tenantId
- **Sprint 1 (parcial):** Documents schema + create/list con validación kind + patientId
- **Sprint 1 (parcial):** Chat sessions (anónimas) + messages con doctorUserIds
- **Sprint 1 (parcial):** AuditLog schema + servicio de escritura
- **Sprint 1 (parcial):** Tests de integración: app, chat, mongo-domain
- Backlog técnico creado en `docs/backlog/`
