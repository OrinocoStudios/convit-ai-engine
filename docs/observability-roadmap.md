# Roadmap de observabilidad

Plan por fases para pasar de “desarrollo con logs puntuales” a operación explorable en hospital.

## Fase 1 — Fundamentos (ahora / corto plazo)

- **Health**: `GET /health`, `GET /health/ready` (Mongo). Usar en orquestador (Docker Swarm, Kubernetes, Nomad, etc.).
- **CI**: pipeline que ejecute lint, tests y build antes de merge.
- **Documentación**: runbook mínimo de “servicio no responde” y variables críticas.

## Fase 2 — Soporte y diagnóstico

- **Logs estructurados** (JSON): nivel, `requestId`/`correlationId`, `tenantId` (solo si política lo permite), ruta HTTP, status, latencia.
- **Campos acordados** con operaciones (tabla en este doc o en runbook) para búsqueda en Elastic/Loki.
- **Errores**: códigos estables y mensaje seguro (sin datos clínicos en logs de error por defecto).

## Fase 3 — Métricas y alertas

- **RED** mínimo: tasa de requests, latencia p95/p99, tasa de 5xx por ruta.
- **Dependencias**: tiempo y errores en llamadas al Brain Service y latencia Mongo.
- **Alertas**: readiness fallando, ratio de errores RAG, disco/log flood.

## Fase 4 — Trazas distribuidas (opcional)

- **OpenTelemetry** (o equivalente) en HTTP entrante y cliente hacia Pinky, con propagación de trace id.
- Útil cuando el hospital ya tenga Jaeger/Tempo/Datadog u otro backend de trazas.

## Fuera de alcance inmediato

- APM comercial completo sin requisito explícito del centro.
