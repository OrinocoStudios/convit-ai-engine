# Convit — Cómo levantar el MVP en local

Tres repositorios en este monorepo: `convit-ai-client` (Vite), `convit-ai-engine/backend` (Nest + Mongo) y `pinky` (Brain / GraphRAG + Neo4j).

## Puertos

| Proyecto | URL típica |
|----------|------------|
| Cliente | `http://localhost:5173` |
| Engine | `http://localhost:3000` |
| Pinky (Brain) | `http://localhost:8081` |
| Mongo (engine) | `localhost:27017` |
| Neo4j (Pinky) | bolt `localhost:7688` (ver `pinky/.env.example`) |

## 1) Pinky (Brain)

```bash
cd pinky
cp .env.example .env
# Ajusta NEO4J_URI, modelos, LLM, etc.
docker compose up -d   # si el repo trae servicios de datos
npm install
npm run start:dev
```

## 2) Engine

```bash
cd convit-ai-engine/backend
cp .env.example .env
# BRAIN_SERVICE_URL=http://localhost:8081
# MONGO_URI=mongodb://localhost:27017/convit
npm install
npm run start:dev
```

Con Docker (solo engine + Mongo), desde `convit-ai-engine`:

```bash
docker compose up --build
# El `docker-compose` publica 3000 y usa BRAIN_SERVICE_URL=http://host.docker.internal:8081
```

Asegúrate de que el proceso Pinky escucha en el host en `8081` para que el backend en contenedor resuelva `host.docker.internal:8081` (macOS/Windows) o ajusta la URL.

## 3) Cliente

```bash
cd convit-ai-client
cp .env.example .env
# VITE_ENGINE_URL=http://localhost:3000
npm install
npm run dev
```

## Comprobaciones

- `GET http://localhost:3000/health/ready` — Mongo conectado y `GET {BRAIN_SERVICE_URL}/health` alcanzable.
- `GET http://localhost:8081/health` — Pinky (Neo4j + sonda LLM).
- Contrato resumido: [`docs/mvp-integration-contracts.md`](./mvp-integration-contracts.md)

