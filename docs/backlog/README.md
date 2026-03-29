# Convit AI Engine – Backlog por sprints

## Fuente de verdad del backlog técnico (IDs)

El inventario accionable con épicas **Infra/QA, Back, Cerebro, Client** y estados **Hecho/Pendiente** está en **[`docs/backlog-cursor/BACKLOG.md`](../backlog-cursor/BACKLOG.md)**. Este directorio `docs/backlog/` complementa con **narrativa por sprint** (`sprint-*.md`).

Al cerrar ítems que tengan ID en `backlog-cursor`, actualiza también ese `BACKLOG.md` y su [CHANGELOG](../backlog-cursor/CHANGELOG.md) según la regla del repo.

## Descripción
Este directorio organiza el trabajo por sprints. Cada archivo de sprint detalla tareas, estado y criterios de aceptación.

## Estructura
```
docs/backlog/
├── README.md                 ← Este archivo
├── CHANGELOG.md              ← Historial de cambios (DEBE mantenerse actualizado)
├── sprint-0-setup.md         ← Scaffold e infraestructura base (COMPLETADO)
├── sprint-1-base.md          ← Auth, pacientes, historias clínicas, RAG base
├── sprint-2-documents.md     ← Upload real, storage, ingesta Brain Service
├── sprint-3-chat.md          ← Chat RAG, LLM, resúmenes, reindexación
├── sprint-4-quality.md       ← Auditoría integrada, Docker prod, auth guards
└── sprint-5-frontend.md      ← Cliente (Next.js) – scope separado
```

## Estados de las tareas
- **DONE** → Tarea completada y en el código
- **IN PROGRESS** → En desarrollo activo
- **TODO** → Pendiente, priorizada para el sprint
- **BLOCKED** → Depende de otra tarea o decisión pendiente
- **DEFERRED** → Movida a un sprint posterior

## Cómo usar este backlog
1. Antes de comenzar cualquier sprint, revisa el archivo correspondiente
2. Actualiza el estado de las tareas conforme avances
3. **Actualiza** [CHANGELOG.md](./CHANGELOG.md) cuando completes una tarea de sprint o hagas un cambio relevante a estos archivos
4. Si una tarea se mueve de sprint, márcala como DEFERRED y agrégala en el sprint destino

## Reglas del agente (OBLIGATORIAS)

### CHANGELOG.md
> **El archivo `CHANGELOG.md` DEBE mantenerse actualizado en todo momento.**
>
> Cada vez que se complete una tarea del backlog, se haga un cambio arquitectónico,
> se agregue una funcionalidad nueva, o se corrija un bug, se DEBE agregar una entrada
> en el CHANGELOG con:
> - Fecha
> - Descripción breve del cambio
> - Sprint/tarea asociada (si aplica)
> - Tipo de cambio (Added, Changed, Fixed, Removed)

### Backlog
- No eliminar tareas completadas — marcarlas como DONE
- Mantener coherencia entre el backlog y el código real
- Si se descubre una tarea nueva durante desarrollo, agregarla al sprint adecuado
