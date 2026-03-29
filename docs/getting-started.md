# Guía de arranque (desarrollo)

## Requisitos

- Node.js 20+
- npm
- Docker (opcional, para Mongo o stack mínimo)

## Backend (NestJS)

```bash
cd backend
cp .env.example .env
# Editar .env: MONGO_URI, BRAIN_SERVICE_URL, opcional CORS_ORIGINS
npm ci
npm run start:dev
```

- API por defecto: `http://localhost:3000`
- Salud: `GET /health` (liveness), `GET /health/ready` (Mongo conectado)

## Tests

```bash
cd backend
npm test
npm run test:integration
```

Convenciones: ver [AGENT.md](../AGENT.md) (Vitest, Mongo in-memory).

## Docker Compose (mínimo)

Desde la raíz del repo:

```bash
docker compose up --build
```

Incluye **solo** `backend` + `mongo`. El Cerebro (Pinky) y Ollama **no** están en este compose: configura `BRAIN_SERVICE_URL` hacia el host donde corran (p. ej. `http://host.docker.internal:8000` en macOS) o un stack conjunto documentado en [08-deployment.md](./08-deployment.md).

## Documentación relacionada

- Contrato HTTP: [05-api-contracts.md](./05-api-contracts.md)
- Variables de entorno: [backend/.env.example](../backend/.env.example)
