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
