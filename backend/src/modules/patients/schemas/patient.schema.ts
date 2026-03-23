import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'patients', timestamps: true })
export class Patient {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  /** Documento Nacional de Identidad o equivalente. */
  @Prop({ index: true })
  dni?: string;

  /** Número de Seguridad Social o equivalente. */
  @Prop({ index: true })
  ssn?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<Patient>;
export const PatientSchema = SchemaFactory.createForClass(Patient);

PatientSchema.index({ tenantId: 1, name: 1 });

// Índices únicos por tenant (permitiendo nulos/ausentes usando partialFilterExpression)
PatientSchema.index(
  { tenantId: 1, dni: 1 },
  {
    unique: true,
    partialFilterExpression: { dni: { $exists: true, $type: 'string' } },
  },
);

PatientSchema.index(
  { tenantId: 1, ssn: 1 },
  {
    unique: true,
    partialFilterExpression: { ssn: { $exists: true, $type: 'string' } },
  },
);
