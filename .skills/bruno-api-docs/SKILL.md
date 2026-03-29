---
name: bruno-api-docs
description: Verifica y sincroniza la colección de Bruno para endpoints de API. Usar cuando se crea un endpoint nuevo, se modifica ruta/método/headers/body/query/response, o se cierra una tarea backend relacionada con contratos HTTP.
---

# Bruno API Docs

## Objetivo

Asegurar que cada endpoint nuevo del backend esté documentado y ejecutable en Bruno antes de cerrar la tarea.

## Regla principal (estricta)

Si se crea un endpoint nuevo, siempre se debe:

1. Verificar si ya existe en Bruno.
2. Si no existe, crearlo.
3. Si existe pero cambió el contrato, actualizarlo.
4. Dejar evidencia en la respuesta final del agente.

No cerrar la tarea sin esta validación.

## Cuándo usar

Aplicar este skill cuando:

- Se agrega un endpoint (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Se cambia ruta, método, auth, headers, query params o body.
- Se cambian respuestas esperadas (status code o payload).
- Se finaliza una tarea de backend con impacto HTTP.

## Flujo obligatorio

### 1) Detectar cambios de contrato

Identificar endpoint y contrato mínimo:

- Método HTTP
- Ruta final
- Auth requerida
- Headers obligatorios
- Query params
- Body de ejemplo
- Respuesta esperada (código y ejemplo)

### 2) Revisar Bruno

Buscar en la colección de Bruno un request equivalente por método + ruta.

- Si existe y coincide: marcar como `OK`.
- Si existe y no coincide: actualizar request y tests.
- Si no existe: crear request nuevo en la colección correcta.

### 3) Alinear entorno y variables

Verificar variables usadas por el request:

- `baseUrl` o equivalente
- token/auth
- ids de recursos de ejemplo

Si falta una variable, agregarla en el entorno correspondiente.

### 4) Verificación mínima

Ejecutar una validación rápida del request (manual o automatizada según el repo) para confirmar que:

- La llamada es ejecutable.
- El endpoint responde con el status esperado en escenario válido.

### 5) Reporte en la respuesta final

Incluir siempre un bloque `Estado Bruno` con este formato:

```markdown
Estado Bruno:
- Endpoint: [METHOD] /ruta
- Colección: <nombre>
- Acción: Creado | Actualizado | Sin cambios
- Request probado: Sí | No (explicar)
- Pendientes: Ninguno | <lista corta>
```

## Checklist de salida

- [ ] Endpoint detectado y contrato definido
- [ ] Bruno verificado (existía o no)
- [ ] Request creado/actualizado si aplicaba
- [ ] Variables de entorno revisadas
- [ ] Validación mínima ejecutada o justificada
- [ ] Bloque `Estado Bruno` incluido en respuesta

## Criterio de bloqueo

Si no se pudo crear/actualizar Bruno en el momento, la respuesta debe:

1. Explicar el bloqueo concreto.
2. Dejar pasos exactos para resolverlo.
3. Marcar explícitamente que la tarea **no** queda cerrada al 100%.
