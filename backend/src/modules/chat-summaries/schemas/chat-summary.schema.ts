import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'chat_summaries', timestamps: true })
export class ChatSummary {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  patientId: string;

  @Prop({ required: true, index: true })
  clinicalHistoryId: string;

  @Prop()
  label?: string; // e.g. "Chat 1", "Chat 2"

  @Prop({ required: true })
  summaryText: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export type ChatSummaryDocument = HydratedDocument<ChatSummary>;
export const ChatSummarySchema = SchemaFactory.createForClass(ChatSummary);

ChatSummarySchema.index({ tenantId: 1, clinicalHistoryId: 1 });
ChatSummarySchema.index({ tenantId: 1, patientId: 1 });
