# Skill: Definir entidades / modelo de datos

## Cuándo usar
Cuando necesites crear o modificar entidades, schemas o modelos de datos en el proyecto.

## Modelo de datos del MVP
Referencia completa en `docs/04-data-model.md`.

### Entidades principales (lógicas)
```
Patient              → id, tenantId, name (colección `patients`)
ClinicalDocument     → id, tenantId, kind global_library|patient, patientId?, uploadedBy, filename, … (colección `clinical_documents`)
AuditLog             → id, tenantId, action, patientId?, clinicalHistoryId?, userId?, metadata (colección `audit_logs`)
GlobalLibraryDocument → concepto de producto; en código unificado como ClinicalDocument con kind global_library
PatientDocument      → concepto de producto; en código ClinicalDocument con kind patient
ClinicalHistory      → id, tenantId, patientId, openedBy, …
ChatSummary          → id, tenantId, patientId, clinicalHistoryId, label UI, summary… (DB resúmenes)
Chunk                → id, tenantId, patientId? (null si global), documentId, scope (Brain Service / externo)
ChatSession/ChatMessage → chat en vivo en Mongo (`chat_sessions`, `chat_messages`)
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

## Relaciones y grafo
Las relaciones complejas (paciente–historia–documento) y el grafo RAG los gestiona el **Brain Service** (externo), no MongoDB de este backend. En Mongo se guardan entidades operacionales y chats; los **resúmenes “Chat N”** pueden vivir en la misma Mongo u otra DB según producto.

## Checklist
- [ ] `tenantId` siempre que aplique contexto de clínica
- [ ] `patientId` para datos de paciente; omitido solo en biblioteca global
- [ ] `clinicalHistoryId` para historias y resúmenes asociados
- [ ] Índices compuestos adecuados
- [ ] timestamps: true habilitado
- [ ] Archivo en kebab-case, clase en PascalCase
- [ ] Schema registrado en el module correspondiente
