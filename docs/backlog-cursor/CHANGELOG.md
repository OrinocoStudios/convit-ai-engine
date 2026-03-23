# Changelog

Todas las notas destacadas de la carpeta `docs/backlog-cursor` se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/) solo para **las versiones de este changelog de backlog** (no para releases de la aplicación).

## [Unreleased]

- **Identidad del Paciente (BK-2)**: Implementación de DNI y SSN como identificadores obligatorios y únicos por clínica.
- **Buscador de Pacientes**: Nuevo endpoint `GET /patients/search?identity=...` para localización rápida.
- **Auditoría Automática (BK-11)**: Integración de `AuditService` en flujos de `Patients`, `History` y `Chat`. Acción trazable automáticamente.
- **Endpoint de Auditoría**: Añadido `GET /audit` para visualización de logs por tenant.
- **Flujo de Chat Automatizado**: ... (ya estaba)
- **Flujo de Chat Automatizado**: Los mensajes del usuario ahora disparan automáticamente una consulta al Cerebro y guardan la respuesta de la IA con sus fuentes.
- **Persistencia de Fuentes**: Actualización del esquema `ChatMessage` para guardar metadatos de citación.

## [0.1.0] - 2026-03-21

### Added

- Estructura inicial de `docs/backlog-cursor`: [BACKLOG.md](./BACKLOG.md) con épicas Infra/QA, Back, Cerebro y Client; ítem de alineación ID-1 (DNI/NSS vs `patientId`); checklist de flujo MVP.
- [README.md](./README.md) con propósito de la carpeta, convenciones, priorización MVP y obligación de mantener este changelog.
- Regla de agente Cursor [`.cursor/rules/maintain-backlog-changelog.mdc`](../../.cursor/rules/maintain-backlog-changelog.mdc) y referencia en [AGENT.md](../../AGENT.md).
