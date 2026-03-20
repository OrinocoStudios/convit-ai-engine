# Skill: Seguridad y aislamiento

## Cuándo usar
Siempre que escribas código que toca datos de pacientes, documentos, chunks, o cualquier dato clínico.

## Principio
Los datos de un paciente de un hospital NUNCA deben ser accesibles por otro hospital ni mezclarse con otro paciente.

## Campos de aislamiento
Toda entidad que contenga datos clínicos DEBE incluir:
- **`tenantId`**: identifica el hospital. Aislamiento a nivel de organización.
- **`patientId`**: identifica el paciente. Aislamiento a nivel individual.

## Entidades que DEBEN tener tenantId + patientId
- `Document`
- `Chunk`
- `Conversation`
- `AuditLog`
- Cualquier entidad nueva que contenga datos clínicos

## Entidades que solo tienen tenantId
- `Patient` (el paciente pertenece a un tenant, pero no tiene patientId propio en el filtro)

## Reglas en queries
TODA query a la base de datos que toque datos clínicos DEBE filtrar por:
```typescript
// CORRECTO
const documents = await this.documentModel.find({
  tenantId: user.tenantId,
  patientId: patientId,
});

// INCORRECTO - NUNCA hacer esto
const documents = await this.documentModel.find({
  patientId: patientId,
  // Falta tenantId → un hospital podría ver datos de otro
});
```

## Reglas en endpoints
- Todo endpoint que accede a datos de paciente requiere autenticación
- El `tenantId` se obtiene del token del usuario autenticado, NUNCA del body
- El `patientId` viene como parámetro del request (path, query, o body)
- Validar que el paciente pertenece al tenant del usuario

## Reglas en Brain Service
Toda llamada al Brain Service DEBE incluir `tenantId` y `patientId`:
```typescript
await this.ragService.query({
  query: dto.query,
  patientId: dto.patientId,
  tenantId: user.tenantId,  // Desde el token, no del body
});
```

## Auditoría
Toda operación sobre datos de pacientes se registra:
```typescript
await this.auditService.log({
  action: 'QUERY_PATIENT',
  patientId: patientId,
  tenantId: user.tenantId,
  userId: user.id,
  timestamp: new Date(),
  metadata: { query: dto.query },
});
```

## Checklist de seguridad
- [ ] tenantId viene del token autenticado
- [ ] patientId validado contra el tenant
- [ ] Queries filtran por AMBOS campos
- [ ] Brain Service recibe ambos campos
- [ ] Operación registrada en audit log
- [ ] No hay dependencias de servicios externos
- [ ] No hay datos sensibles en logs de aplicación
