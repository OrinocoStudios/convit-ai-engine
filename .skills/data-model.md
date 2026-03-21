# Skill: Definir entidades / modelo de datos

## Cuándo usar
Cuando necesites crear o modificar entidades, schemas o modelos de datos en el proyecto.

## Modelo de datos del MVP
Referencia completa en `docs/04-data-model.md`.

### Entidades principales (lógicas)
```
Patient              → id, tenantId, name
GlobalLibraryDocument → id, tenantId, uploadedBy, … (sin patientId)
PatientDocument      → id, tenantId, patientId, type, flags (p. ej. tool call)
ClinicalHistory      → id, tenantId, patientId, openedBy, …
ChatSummary          → id, tenantId, patientId, clinicalHistoryId, label UI, summary… (DB resúmenes)
Chunk                → id, tenantId, patientId? (null si global), documentId, scope
Conversation/Message → chat en vivo (opcional)
AuditLog             → id, tenantId, patientId?, clinicalHistoryId?, action, userId, …
```

## Patrón de entidad (MongoDB con Mongoose)
```typescript
// entities/patient-document.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDocument } from 'mongoose';

@Schema({ timestamps: true })
export class PatientDocumentEntity extends MongoDocument {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  patientId: string;

  @Prop({ required: true })
  type: string;
}

export const PatientDocumentSchema = SchemaFactory.createForClass(PatientDocumentEntity);
PatientDocumentSchema.index({ tenantId: 1, patientId: 1 });
```

## Reglas obligatorias
1. **Toda entidad con datos clínicos por paciente** incluye `tenantId` y `patientId`
2. **Biblioteca global**: `tenantId` obligatorio; **sin** `patientId`
3. **Historias y resúmenes**: `clinicalHistoryId` donde corresponda
4. Crear **índices compuestos** acordes: `{ tenantId: 1, patientId: 1 }` para entidades de paciente; `{ tenantId: 1 }` para global
5. `tenantId` y `patientId` (cuando apliquen) con **index: true**
6. Usar `{ timestamps: true }` en el schema para `createdAt` / `updatedAt` automáticos
7. Nombres de entidades en **PascalCase**, archivos en **kebab-case**

## Cuándo agregar campos
- Datos del paciente → `tenantId` + `patientId`
- Ámbito de historia → `clinicalHistoryId`
- Metadata → `Record<string, any>` si hace falta flexibilidad
- Referencias → ids estables de la entidad referenciada

## Relaciones en Neo4j
Las relaciones complejas (paciente–historia–documento) pueden modelarse en Neo4j según diseño; los **resúmenes “Chat N”** pueden vivir solo en la DB operacional de conversaciones.

## Checklist
- [ ] `tenantId` siempre que aplique contexto de clínica
- [ ] `patientId` para datos de paciente; omitido solo en biblioteca global
- [ ] `clinicalHistoryId` para historias y resúmenes asociados
- [ ] Índices compuestos adecuados
- [ ] timestamps: true habilitado
- [ ] Archivo en kebab-case, clase en PascalCase
- [ ] Schema registrado en el module correspondiente
