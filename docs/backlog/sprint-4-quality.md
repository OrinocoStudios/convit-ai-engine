# Sprint 4 – Calidad: Auditoría Integrada, Docker Prod, Auth Guards

**Estado:** TODO

## Objetivo
Integrar auditoría en todos los módulos, implementar guards de autenticación, preparar Docker para producción, y asegurar error handling consistente.

---

## Tareas

### S4-01: Integrar AuditService en módulos existentes — TODO
- El AuditService existe pero no se llama desde ningún otro módulo
- Integrar registro de auditoría en:
  - **Chat:** cada query, cada respuesta, inicio/cierre de sesión
  - **Documents:** upload, descarga
  - **Patients:** creación, consulta
  - **ClinicalHistory:** creación, consulta
- Cada audit log debe incluir: `tenantId`, `action`, `patientId`, `clinicalHistoryId`, `userId`, `metadata`
- **Criterio de aceptación:** Toda acción sobre datos clínicos deja registro en audit_logs

### S4-02: Endpoint de consulta de audit logs — TODO
- `GET /audit/logs?tenantId=&patientId=&action=&from=&to=`
- Paginación
- Filtros por fecha, acción, paciente, historia clínica
- Solo accesible por admins (guard de rol)
- **Depende de:** S1-05 (AuditLog schema — DONE), S4-01
- **Criterio de aceptación:** Un admin puede consultar el historial de auditoría filtrado

### S4-03: Auth guards y middleware — TODO
- Implementar `TenantGuard` que valide `x-tenant-id` en todas las rutas protegidas
- Implementar `AuthGuard` que valide credenciales (JWT o API key, según decisión S1-08)
- Aplicar guards globalmente o por módulo según necesidad
- Eliminar validaciones manuales de `x-tenant-id` repetidas en cada controller
- **Depende de:** S1-08 (Auth básica)
- **Criterio de aceptación:** Los guards manejan la validación de tenant y auth de forma centralizada

### S4-04: Error handling global — TODO
- Implementar `ExceptionFilter` global para errores consistentes
- Formato de error estandarizado: `{ statusCode, message, error, timestamp, path }`
- Logging de errores con nivel apropiado
- No exponer stack traces en producción
- **Criterio de aceptación:** Todos los errores tienen formato consistente y se loguean

### S4-05: Docker Compose completo para producción — TODO
- Actualizar `docker-compose.yml` con:
  - Backend NestJS
  - MongoDB (con volumen persistente — ya existe)
  - Brain Service (Pinky)
  - Ollama con modelo Qwen
- Crear `docker-compose.prod.yml` con configuración de producción
- Health checks para todos los servicios
- Red interna para comunicación entre servicios
- Variables de entorno para producción
- **Criterio de aceptación:** `docker-compose up` levanta todo el stack funcional

### S4-06: Validación de aislamiento end-to-end — TODO
- Tests que verifican que un tenant no puede acceder a datos de otro tenant
- Tests que verifican que un patientId no filtra datos de otro paciente
- Tests que verifican que clinicalHistoryId aísla correctamente
- **Criterio de aceptación:** No hay forma de obtener datos cruzados entre tenants/pacientes

### S4-07: Health check endpoint — TODO
- `GET /health` que verifica:
  - Conexión a MongoDB
  - Conexión a Brain Service
  - Estado general del backend
- Para Docker health checks y monitoreo
- **Criterio de aceptación:** El endpoint reporta el estado de todas las dependencias

### S4-08: Configuración CORS para producción — TODO
- Restringir CORS a orígenes permitidos (actualmente `app.enableCors()` sin restricción)
- Configurar via variable de entorno `ALLOWED_ORIGINS`
- **Criterio de aceptación:** Solo orígenes permitidos pueden acceder a la API

---

## Dependencias
- Sprint 1 completo (auth, clinical histories)
- Sprint 2 y 3 completos (para integrar auditoría en todos los flujos)
- Brain Service y Ollama dockerizados
