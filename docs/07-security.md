# Seguridad

## Reglas
- On-premise
- Sin APIs externas no autorizadas
- Aislamiento por **tenant** (clínica)
- Aislamiento por **paciente** cuando el dato es clínico individual
- Aislamiento por **historia clínica** cuando se accede a hilos o resúmenes “Chat N”

## Superficies de datos
- **Biblioteca RAG global**: solo `tenantId`; no mezclar con otros tenants; no exponer como dato de un paciente concreto
- **Documentos y chunks de paciente**: `tenantId` + `patientId`
- **Resúmenes de chat**: `tenantId` + `patientId` + `clinicalHistoryId`

## Riesgos
- Fuga de datos
- Mezcla de pacientes o de tenants
- Fuga de contexto entre historias del mismo paciente

## Mitigación
- `tenantId` en token y en toda query persistente
- `patientId` validado en cada request que no sea solo biblioteca global
- `clinicalHistoryId` validado contra el paciente y el tenant
- Auditoría de lecturas y consultas con metadatos de ámbito

## Estado MVP (backend actual)

- **Identidad**: gran parte del API confía en cabeceras `x-tenant-id` y `x-doctor-user-id`. Cualquier cliente en la misma red podría falsificarlas hasta que exista **JWT/OIDC o API keys** por tenant (ver backlog `BK-12`).
- **CORS**: sin `CORS_ORIGINS`, la API permite cualquier origen (adecuado solo en dev o red cerrada). En hospital, definir `CORS_ORIGINS` con el origen del frontend.
- **`POST /rag/query`**: proxy al Brain sin las mismas cabeceras que el resto del API; tratarlo como **endpoint interno** (solo red privada, mTLS o deshabilitar en producción si no es necesario).

## Referencias

- Contratos HTTP: [05-api-contracts.md](./05-api-contracts.md)
- Runbooks: [runbooks/](./runbooks/)
