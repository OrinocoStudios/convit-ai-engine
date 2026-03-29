# Convit AI — Backend (NestJS)

API del motor Convit: pacientes, documentos, chat persistido, RAG vía Brain Service (Pinky), auditoría.

## Documentación del producto

- Contexto y reglas: [AGENT.md](../AGENT.md)
- Arranque, tests, Docker: [docs/getting-started.md](../docs/getting-started.md)
- Contrato HTTP: [docs/05-api-contracts.md](../docs/05-api-contracts.md)

## Comandos

```bash
cp .env.example .env
npm ci
npm run start:dev      # desarrollo
npm test               # unitarios
npm run test:integration
npm run lint           # corrige con --fix (local)
npm run lint:ci        # CI, sin --fix
npm run build
```

## Variables

Ver [.env.example](./.env.example): `PORT`, `MONGO_URI`, `BRAIN_SERVICE_URL`, opcional `CORS_ORIGINS`.
