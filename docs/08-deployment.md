# Deployment

## Qué incluye este repositorio

El archivo [docker-compose.yml](../docker-compose.yml) en la raíz levanta **solo**:

- **backend** — API NestJS (imagen construida desde `backend/Dockerfile`).
- **mongo** — MongoDB 7 con volumen persistente.

Variables típicas del backend (ver [backend/.env.example](../backend/.env.example)):

- `PORT`, `MONGO_URI`, `BRAIN_SERVICE_URL`
- Opcional: `CORS_ORIGINS` (orígenes permitidos; ver [07-security.md](./07-security.md))

## Brain Service (Pinky) y Ollama

No forman parte del `docker-compose.yml` actual. En despliegue conjunto:

1. Ejecutar Pinky (y Ollama si aplica) según el proyecto [Pinky](https://github.com/OrinocoStudios/pinky) o imagen interna del hospital.
2. Configurar `BRAIN_SERVICE_URL` para que el backend resuelva el host:
   - Pinky en el mismo host que Docker Desktop: a menudo `http://host.docker.internal:8000` (macOS/Windows).
   - En Linux o Kubernetes: DNS interno o IP del servicio (p. ej. `http://brain-service:8000` dentro de la misma red de composición).

El valor por defecto en compose (`http://brain-service:8000`) asume un servicio llamado `brain-service` en la misma red Docker; **si no lo añades al compose**, sobrescribe la variable en `docker-compose.yml` o en un archivo `compose.override` local (no versionado si contiene secretos).

## Salud y orquestación

- **Liveness**: `GET /health`
- **Readiness** (Mongo): `GET /health/ready`

Usar estas rutas en balanceadores y orquestadores.

## Producción (notas)

- No exponer el puerto Mongo a Internet; restringir por red interna/VPC.
- Definir `CORS_ORIGINS` explícito para el origen del frontend hospitalario.
- Imagen backend: proceso bajo usuario no root (`nestjs` en `backend/Dockerfile`).

## Documentación relacionada

- Arranque local: [getting-started.md](./getting-started.md)
- Runbooks: [runbooks/](./runbooks/)
