# Skill: Documentar cambios en docs/CHANGELOG.md

## Cuándo usar
Usar esta skill cuando se haga cualquier cambio técnico en el repositorio (código, configuración, infraestructura, tests o documentación técnica).

## Regla principal
Todo cambio técnico DEBE quedar documentado en `docs/CHANGELOG.md` antes de cerrar la tarea.

## Flujo obligatorio
1. Identificar qué cambió y por qué.
2. Abrir `docs/CHANGELOG.md`.
3. Si el archivo no existe, crearlo con formato Keep a Changelog y sección `## [Unreleased]`.
4. Registrar una entrada detallada bajo `## [Unreleased]` en la sección correcta:
   - `Added`: funcionalidades nuevas.
   - `Changed`: ajustes, mejoras o refactors.
   - `Fixed`: correcciones de bugs.
   - `Removed`: eliminaciones o deprecaciones.
5. Describir impacto técnico real (módulo/servicio afectado, comportamiento nuevo, bug corregido, compatibilidad).
6. Verificar que la redacción sea clara y accionable, no genérica.
7. No finalizar la tarea si falta esta actualización.

## Plantilla de entrada recomendada
- `<tipo>: <componente o módulo> — <cambio concreto> (<motivo/impacto>)`

Ejemplos:
- `Added: chat-service — soporte de reintentos con backoff para timeout de proveedor IA (mejora resiliencia en picos).`
- `Changed: auth-guard — validación de tenant movida a middleware compartido (reduce duplicación y errores).`
- `Fixed: upload-controller — corrige fallo al procesar PDF sin metadatos (evita 500 en producción).`
- `Removed: legacy-summary-endpoint — eliminado endpoint v1 deprecado (sin consumo activo).`

## Criterios de calidad
- No usar frases vagas como "se hicieron cambios".
- Incluir siempre el componente afectado.
- Explicar el efecto técnico o funcional.
- Mantener una entrada por cambio significativo.

## Checklist antes de terminar
- [ ] `docs/CHANGELOG.md` actualizado
- [ ] Entrada en `Unreleased` y sección correcta
- [ ] Cambio descrito con impacto
- [ ] No hay cambios técnicos sin registrar
