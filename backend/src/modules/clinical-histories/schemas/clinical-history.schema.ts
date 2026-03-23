import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'clinical_histories', timestamps: true })
export class ClinicalHistory {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  patientId: string;

  @Prop({ required: true })
  openedBy: string;

  @Prop({ required: true })
  title: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ClinicalHistoryDocument = HydratedDocument<ClinicalHistory>;
export const ClinicalHistorySchema = SchemaFactory.createForClass(ClinicalHistory);

ClinicalHistorySchema.index({ tenantId: 1, patientId: 1 });
