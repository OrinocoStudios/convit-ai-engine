# Sprint 0 – Setup e Infraestructura Base

**Estado:** COMPLETADO

## Objetivo
Inicializar el proyecto NestJS con la estructura modular, infraestructura Docker, testing y documentación base.

---

## Tareas

### S0-01: Scaffold NestJS — DONE
- Proyecto NestJS generado en `backend/`
- TypeScript estricto
- ESLint + Prettier configurados
- **Archivos:** `backend/` completo

### S0-02: Dependencias base — DONE
- `@nestjs/mongoose` + `mongoose`
- `class-validator` + `class-transformer`
- `@nestjs/config`
- **Archivo:** `backend/package.json`

### S0-03: Estructura de 6 módulos — DONE
- `modules/auth/` → module, controller, service
- `modules/patients/` → module, controller, service
- `modules/documents/` → module, controller, service
- `modules/rag/` → module, controller, service
- `modules/chat/` → module, controller, service
- `modules/audit/` → module, controller, service
- **Archivos:** `backend/src/modules/*/`

### S0-04: Configuración global — DONE
- `.env.example` con PORT, MONGO_URI, BRAIN_SERVICE_URL
- ConfigModule global en `app.module.ts`
- ValidationPipe global en `main.ts` (whitelist + forbidNonWhitelisted + transform)
- CORS habilitado
- **Archivos:** `backend/.env.example`, `backend/src/app.module.ts`, `backend/src/main.ts`

### S0-05: Docker — DONE
- `Dockerfile` para el backend
- `docker-compose.yml` en raíz con: backend, mongo
- **Archivos:** `backend/Dockerfile`, `docker-compose.yml`

### S0-06: Testing framework — DONE
- Vitest configurado (unit + integration)
- `unplugin-swc` para decoradores NestJS
- `mongodb-memory-server` para tests sin dependencia externa
- Helper reutilizable en `test/helpers/integration-setup.ts`
- **Archivos:** `vitest.config.ts`, `vitest.config.integration.ts`, `test/helpers/`

### S0-07: Documentación — DONE
- `README.md` con visión general del MVP
- `AGENT.md` con contexto completo para agentes AI
- `docs/00` a `docs/08` (overview, architecture, flows, RAG, data model, API, backlog, security, deployment)
- `.skills/` con 6 skills accionables
- **Archivos:** `README.md`, `AGENT.md`, `docs/`, `.skills/`

### S0-08: .gitignore — DONE
- Node.js/NestJS (node_modules, dist, .env, .DS_Store, IDEs)
- **Archivo:** `.gitignore`
