# Runbook: Backend caído o inestable

## Comprobaciones rápidas

1. **Proceso / contenedor**
   - Ver logs del contenedor `backend` (o proceso `node dist/main`).
2. **Puerto**
   - Confirmar que `PORT` (por defecto 3000) escucha en el host esperado.
3. **Variables**
   - `MONGO_URI` apunta al host correcto y credenciales válidas.
   - `BRAIN_SERVICE_URL` alcanzable desde la red del backend (no basta que funcione en tu laptop si el Brain está en otro host).
4. **Readiness**
   - `GET /health/ready` debe devolver 200 con `mongo: connected`. Si devuelve 503, Mongo no está conectado (red, credenciales, o Mongo caído).

## Acciones

- Reiniciar el servicio backend tras confirmar Mongo disponible.
- Si hay corrupción de configuración, restaurar `.env` / secretos desde el gestor acordado por el hospital (no commitear secretos en git).

## Escalado

- Si el fallo persiste tras Mongo estable: revisar logs de aplicación y disco (OOM, permisos de usuario no root en volumenes si aplica).
