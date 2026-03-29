# Changelog técnico (ingeniería)

Registro cronológico de cambios con impacto en código, despliegue u operación.  
Para el backlog accionable y su historial de carpeta, ver [backlog-cursor/CHANGELOG.md](./backlog-cursor/CHANGELOG.md).

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added

- Módulo `HealthModule`: `GET /health` (liveness), `GET /health/ready` (readiness MongoDB).
- Workflow GitHub Actions `.github/workflows/ci.yml`: lint CI, tests, build, audit (informativo).
- Documentación: `docs/README.md`, `docs/getting-started.md`, `docs/adr/`, `docs/technical-changelog.md`, `docs/observability-roadmap.md`, `docs/runbooks/`.
- Variable opcional `CORS_ORIGINS` (orígenes permitidos; vacío = comportamiento anterior).

### Changed

- `Dockerfile` del backend: usuario no root `nestjs` para la imagen final.
- `package.json`: script `lint:ci` sin `--fix` para CI.
- Documentación alineada: `docs/05-api-contracts.md`, `docs/04-data-model.md`, `docs/08-deployment.md`, fuente de verdad backlog en `docs/README.md` y [AGENT.md](../AGENT.md).

### Security

- Endurecimiento opcional de CORS vía `CORS_ORIGINS` para despliegues reales.

## Referencias de decisiones

- [ADR-0001: Identificadores paciente (DNI/SSN)](./adr/0001-patient-identifier-dni-ssn.md)
