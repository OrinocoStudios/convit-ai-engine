# Backlog Cursor (`docs/backlog-cursor`)

Esta carpeta concentra el **backlog técnico accionable** para agentes y el equipo: tareas con ID, estado, criterios de aceptación y referencias al código o a la documentación de diseño.

## Contenido

| Archivo        | Uso |
| -------------- | --- |
| [BACKLOG.md](./BACKLOG.md) | Ítems por epic (Infra/QA, Back, Cerebro, Client) y checklist del flujo MVP. |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios **solo de esta carpeta** (estructura del backlog, épicas añadidas o cerradas, replanificaciones relevantes). |

## Cómo encaja con el resto del repo

- **Principios y reglas no negociables**: [AGENT.md](../../AGENT.md) (fuentes obligatorias, `tenantId` / `patientId` / `clinicalHistoryId`, on-premise).
- **Modelo de datos y contratos API**: [docs/04-data-model.md](../04-data-model.md), [docs/05-api-contracts.md](../05-api-contracts.md).
- **Plan por sprints (alto nivel)**: [docs/06-backlog.md](../06-backlog.md) — debe seguir alineado con [BACKLOG.md](./BACKLOG.md) cuando se cierren entregas.

## Arquitectura en tres piezas (producto)

- **Client**: interfaz (p. ej. Next.js); hoy **no** vive en este repositorio.
- **Back**: NestJS + MongoDB en `backend/` (este repo).
- **Cerebro**: RAG ([Pinky](https://github.com/OrinocoStudios/pinky)), servicio externo integrado por HTTP.

## Estados en el backlog

Ver la tabla “Leyenda de estado” al inicio de [BACKLOG.md](./BACKLOG.md): **Hecho**, **En curso**, **Pendiente**.

## Priorización MVP

Priorizar en este orden lógico: **ID-1** (identificador paciente) → **BK-13** / **CR-1** (query RAG estable) → **BK-8** / **BK-9** (chat con fuentes y bienvenida sin datos) → **BK-10** + **CR-2** / **CR-3** (cierre, resumen, indexación) → **CL-*** (Client) en paralelo cuando el contrato del Back esté cerrado.

## Mantener el CHANGELOG siempre actualizado

Cualquier cambio **sustantivo** en [BACKLOG.md](./BACKLOG.md) debe reflejarse **en el mismo cambio lógico** (mismo PR o commit) en [CHANGELOG.md](./CHANGELOG.md):

- Añadir o eliminar épicas o ítems con ID.
- Cambiar un ítem de **Pendiente** a **Hecho** (o cancelarlo / replantearlo de forma relevante).
- Reordenar prioridades MVP de forma que afecte al plan de entrega.

Las entradas nuevas van bajo `## [Unreleased]` hasta que se etiquete una versión del changelog (ver convención en [CHANGELOG.md](./CHANGELOG.md)).

La regla de Cursor [`.cursor/rules/maintain-backlog-changelog.mdc`](../../.cursor/rules/maintain-backlog-changelog.mdc) obliga a los agentes a actualizar el CHANGELOG junto con el BACKLOG.
