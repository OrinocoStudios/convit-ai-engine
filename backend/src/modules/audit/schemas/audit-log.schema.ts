import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ index: true })
  patientId?: string;

  @Prop({ index: true })
  clinicalHistoryId?: string;

  @Prop({ required: true })
  action: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export type AuditLogDocument = HydratedDocument<AuditLog>;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
