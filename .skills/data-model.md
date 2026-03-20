# Skill: Definir entidades / modelo de datos

## Cuándo usar
Cuando necesites crear o modificar entidades, schemas o modelos de datos en el proyecto.

## Modelo de datos del MVP
Referencia completa en `docs/04-data-model.md`.

### Entidades principales
```
Patient        → id, tenantId, name
Document       → id, tenantId, patientId, type
Chunk          → id, tenantId, patientId, documentId
Conversation   → id, patientId, tenantId
Message        → id, conversationId, content, role, timestamp
AuditLog       → id, patientId, tenantId, action, userId, timestamp, metadata
```

## Patrón de entidad (MongoDB con Mongoose)
```typescript
// entities/document.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDocument } from 'mongoose';

@Schema({ timestamps: true })
export class DocumentEntity extends MongoDocument {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  patientId: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  filename: string;

  @Prop()
  metadata: Record<string, any>;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);

// Índice compuesto para queries eficientes con aislamiento
DocumentSchema.index({ tenantId: 1, patientId: 1 });
```

## Reglas obligatorias
1. **Toda entidad con datos clínicos** DEBE incluir `tenantId` y `patientId`
2. Crear **índice compuesto** `{ tenantId: 1, patientId: 1 }` en entidades clínicas
3. `tenantId` y `patientId` son **required** y tienen **index: true**
4. Usar `{ timestamps: true }` en el schema para `createdAt` / `updatedAt` automáticos
5. Nombres de entidades en **PascalCase**, archivos en **kebab-case**

## Cuándo agregar campos
Al agregar un campo nuevo a una entidad:
- Si contiene datos del paciente → requiere `tenantId` + `patientId`
- Si es metadata → usar tipo `Record<string, any>` para flexibilidad
- Si es una referencia → usar el `id` de la entidad referenciada (no ObjectId de Mongo directamente)

## Relaciones en Neo4j
Las relaciones clínicas complejas (paciente-documento-diagnóstico) van en Neo4j, no en MongoDB. MongoDB es para datos operacionales.

```
(Patient)-[:HAS_DOCUMENT]->(Document)
(Document)-[:HAS_CHUNK]->(Chunk)
(Patient)-[:HAS_CONVERSATION]->(Conversation)
```

Las relaciones en Neo4j también deben mantener `tenantId` como propiedad para filtrado.

## Checklist
- [ ] tenantId y patientId incluidos (si aplica)
- [ ] Índice compuesto creado
- [ ] timestamps: true habilitado
- [ ] Archivo en kebab-case, clase en PascalCase
- [ ] Schema registrado en el module correspondiente
