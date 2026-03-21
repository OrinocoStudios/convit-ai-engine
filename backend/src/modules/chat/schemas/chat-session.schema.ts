import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Sesión de chat direccionable de forma anónima hacia fuera (`anonymousPublicId`).
 * La relación con médicos es explícita (`doctorUserIds`, `primaryDoctorUserId`).
 * `patientId` se guarda solo para resolución interna y políticas de aislamiento;
 * las respuestas “anónimas” de API no deben exponerlo.
 */
@Schema({ collection: 'chat_sessions', timestamps: true })
export class ChatSession {
  @Prop({ required: true, index: true })
  tenantId: string;

  /** UUID v4: identificador opaco para URLs, logs públicos y cliente sin revelar ObjectId ni datos clínicos. */
  @Prop({ required: true })
  anonymousPublicId: string;

  /** User ids de médicos asociados al hilo (creador + colegas invitados, etc.). */
  @Prop({ type: [String], default: [] })
  doctorUserIds: string[];

  /** Médico que abrió la sesión (debe estar incluido en `doctorUserIds`). */
  @Prop({ required: true, index: true })
  primaryDoctorUserId: string;

  /** Referencia interna al paciente (no exponer en endpoints anónimos). */
  @Prop({ required: true, index: true })
  patientId: string;

  @Prop({ index: true })
  clinicalHistoryId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ChatSessionDocument = HydratedDocument<ChatSession>;
export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

ChatSessionSchema.index(
  { tenantId: 1, anonymousPublicId: 1 },
  { unique: true },
);
ChatSessionSchema.index({ tenantId: 1, patientId: 1, clinicalHistoryId: 1 });
