# Runbook: MongoDB y Brain Service (Pinky)

## MongoDB

### Síntomas

- `GET /health/ready` → 503, `mongo: disconnected`.
- Errores de conexión en logs del backend.

### Comprobaciones

1. Contenedor/proceso `mongo` en ejecución.
2. `MONGO_URI` coherente con host/puerto/replicaSet si aplica.
3. En **desarrollo** con `docker-compose.yml`: el servicio `mongo` expone `27017`; en **producción** no debe exponerse a red pública sin firewall.

### Acciones

- Reiniciar Mongo si está en estado inconsistente; seguir política de backup del hospital antes de operaciones destructivas.

## Brain Service (Pinky)

### Síntomas

- Chat sin respuesta de IA o mensajes genéricos de degradación.
- Errores HTTP/timeouts en cliente RAG del backend.

### Comprobaciones

1. `BRAIN_SERVICE_URL` resoluble desde el contenedor del backend (`host.docker.internal`, IP interna, nombre DNS interno).
2. El stack documentado en [../08-deployment.md](../08-deployment.md): este repo solo incluye backend+mongo en Compose; Pinky suele ser **servicio aparte**.

### Acciones

- Restaurar Pinky u Ollama según arquitectura desplegada.
- Si el hospital apaga el Brain por mantenimiento, informar a usuarios: el producto puede degradarse según implementación del `ChatService`.
