import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicalDocumentKind = 'global_library' | 'patient';

@Schema({ collection: 'clinical_documents', timestamps: true })
export class ClinicalDocument {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({
    type: String,
    enum: ['global_library', 'patient'],
    required: true,
    index: true,
  })
  kind: ClinicalDocumentKind;

  @Prop({ index: true })
  patientId?: string;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ required: true })
  filename: string;

  @Prop()
  storageKey?: string;

  @Prop()
  mimeType?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ClinicalDocumentDocument = HydratedDocument<ClinicalDocument>;
export const ClinicalDocumentSchema =
  SchemaFactory.createForClass(ClinicalDocument);

ClinicalDocumentSchema.index({ tenantId: 1, kind: 1 });
ClinicalDocumentSchema.index({ tenantId: 1, patientId: 1 });
