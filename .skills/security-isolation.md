# Skill: Seguridad y aislamiento

## Cuándo usar
Siempre que escribas código que toca datos de pacientes, documentos, chunks, historias clínicas, resúmenes de chat o cualquier dato clínico.

## Principio
Los datos de un paciente de un hospital NUNCA deben ser accesibles por otro hospital ni mezclarse con otro paciente. La **biblioteca global** es compartida solo **dentro del mismo tenant**.

## Campos de aislamiento
- **`tenantId`**: clínica / hospital. Obligatorio en casi todas las entidades.
- **`patientId`**: paciente. Obligatorio cuando el dato es por persona; **no** se usa en documentos de **biblioteca RAG global**.
- **`clinicalHistoryId`**: historia clínica bajo un paciente. Obligatorio para operaciones y resúmenes “Chat N” ligados a esa historia.

## Entidades que DEBEN tener tenantId + patientId
- `PatientDocument`, `ClinicalHistory`, `ChatSummary` (resúmenes)
- `Chunk` cuando el chunk es de paciente
- `Conversation` / mensajes con contexto de paciente
- `AuditLog` cuando la acción es sobre un paciente

## Entidades que solo tienen tenantId (sin patientId)
- `GlobalLibraryDocument` (PDFs compartidos del tenant)
- `Patient` (el registro de paciente tiene `tenantId`; el propio paciente no tiene “patientId” como campo de filtro sobre sí mismo)

## Reglas en queries
TODA query que toque datos de paciente DEBE filtrar por:
```typescript
const documents = await this.patientDocumentModel.find({
  tenantId: user.tenantId,
  patientId: patientId,
});
```

Para biblioteca global:
```typescript
const globals = await this.globalLibraryModel.find({
  tenantId: user.tenantId,
});
```

Para resúmenes de una historia:
```typescript
const summaries = await this.chatSummaryModel.find({
  tenantId: user.tenantId,
  patientId: patientId,
  clinicalHistoryId: clinicalHistoryId,
});
```

## Reglas en endpoints
- Autenticación obligatoria
- El `tenantId` se obtiene del token del usuario autenticado, NUNCA del body sin validar
- Validar que el paciente y la historia pertenecen al tenant del usuario

## Reglas en Brain Service
Toda llamada al Brain Service incluye al menos `tenantId`. Añadir `patientId` y `clinicalHistoryId` según `scopes` acordados.

```typescript
await this.ragService.query({
  query: dto.query,
  tenantId: user.tenantId,
  patientId: dto.patientId,
  clinicalHistoryId: dto.clinicalHistoryId,
  scopes: dto.scopes,
});
```

## Auditoría
Registrar operaciones con el nivel de detalle necesario, incluyendo `clinicalHistoryId` cuando la acción sea por historia.

## Checklist de seguridad
- [ ] `tenantId` viene del token autenticado
- [ ] `patientId` / `clinicalHistoryId` validados contra el tenant
- [ ] Queries filtran por los campos de aislamiento correctos
- [ ] Brain Service recibe el contexto de ámbito acordado
- [ ] Operación registrada en audit log
- [ ] No hay dependencias de servicios externos no autorizados
- [ ] No hay datos sensibles en logs de aplicación
