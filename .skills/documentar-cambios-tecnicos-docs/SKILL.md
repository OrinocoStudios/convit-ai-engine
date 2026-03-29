---
name: documentar-cambios-tecnicos-docs
description: Documenta cambios tecnicos en la carpeta docs usando changelog y ADR, incluyendo modelos de datos y decisiones de arquitectura. Usar cuando haya cambios de codigo, cambios de esquema/modelo de datos, refactors tecnicos, o cierre de feature/sprint.
---

# Documentar Cambios Tecnicos en Docs

## Objetivo

Mantener trazabilidad tecnica en `docs/` para que el equipo pueda entender:

- que cambio;
- por que cambio;
- como impacta el modelo de datos y la arquitectura.

## Cuándo usar

Aplicar esta skill cuando ocurra cualquiera de estos escenarios:

- cambio de codigo con impacto tecnico;
- cambio de entidades, schemas, contratos o migraciones de datos;
- cambio de arquitectura, integraciones o decisiones de diseno;
- cierre de feature, release o sprint.

## Estructura de documentacion (obligatoria)

Registrar siempre en dos capas:

1. `docs/technical-changelog.md` para el registro cronologico de cambios tecnicos.
2. `docs/adr/` para decisiones importantes (Architecture Decision Records).

Si no existen, crearlos.

## Flujo operativo

1. Identificar el cambio tecnico y su alcance.
2. Verificar si impacta modelo de datos, contratos o arquitectura.
3. Actualizar `docs/technical-changelog.md` en `## [Unreleased]`.
4. Si hay una decision relevante, crear ADR en `docs/adr/ADR-xxxx-<slug>.md`.
5. Enlazar ADR desde el changelog.
6. Validar que la entrada incluya impacto, riesgos y acciones de migracion (si aplica).
7. No cerrar la tarea si esta documentacion no fue actualizada.

## Formato recomendado para changelog tecnico

Usar secciones de Keep a Changelog:

- `Added`
- `Changed`
- `Removed`
- `Fixed` (cuando corresponda)

Para cada item, usar este formato detallado:

`- [AREA] Cambio tecnico concreto.`
`  - Motivo: ...`
`  - Impacto: ...`
`  - Data model: ...`
`  - Migracion: ...`
`  - Riesgo: ...`
`  - ADR: ... (si aplica)`

## Template bilingue (ES/EN) para cada entrada

```markdown
- [AREA] ES: <cambio tecnico concreto> | EN: <specific technical change>
  - Motivo / Reason: <por que se hizo>
  - Impacto / Impact: <que cambia en runtime, APIs, performance, seguridad o DX>
  - Modelo de datos / Data model: <entidades/campos/indices/contratos afectados o "Sin cambios">
  - Migracion / Migration: <pasos de migracion o "No requerida">
  - Riesgo / Risk: <riesgo principal y mitigacion>
  - ADR: <ruta o N/A>
```

## Criterios para crear ADR

Crear ADR cuando el cambio:

- introduce un patron arquitectonico nuevo;
- modifica decisiones base de persistencia, integracion o seguridad;
- implica trade-offs importantes o reversibilidad baja;
- afecta a mas de un modulo o equipo.

## Template ADR (breve)

```markdown
# ADR-xxxx: <titulo>

## Status
Accepted | Proposed | Superseded

## Context
<problema y restricciones>

## Decision
<decision tomada>

## Consequences
<impactos positivos, negativos y deuda>

## Data model impact
<cambios de entidades, campos, indices, migraciones o "None">
```

## Checklist de calidad antes de cerrar

- [ ] `docs/technical-changelog.md` actualizado en `Unreleased`
- [ ] Entrada detallada en formato bilingue ES/EN
- [ ] Impacto en modelo de datos explicitado
- [ ] Migracion indicada (o "No requerida")
- [ ] ADR creada y enlazada cuando aplica
- [ ] Sin frases vagas (ej. "se hicieron cambios")

## Regla de salida

Si hay cambios tecnicos y no hay actualizacion en `docs/`, la tarea no se considera completa.
