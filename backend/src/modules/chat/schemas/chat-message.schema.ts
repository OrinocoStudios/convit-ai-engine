import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Mensaje de chat. No incluye datos identificativos del paciente en el contenido;
 * la vinculación al paciente es vía `ChatSession`.
 * Opcionalmente se registra qué médico envió turnos `user`.
 */
@Schema({ collection: 'chat_messages', timestamps: true })
export class ChatMessage {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true,
  })
  sessionId: Types.ObjectId;

  /** Denormalizado para consultas por id público sin join. */
  @Prop({ required: true, index: true })
  sessionAnonymousPublicId: string;

  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role: 'user' | 'assistant' | 'system';

  @Prop({ required: true })
  content: string;

  /** Fuentes citadas por la IA si role === assistant. */
  @Prop({ type: [Object], default: [] })
  sources?: {
    content: string;
    source: string;
    documentId?: string;
    scope: string;
    metadata?: Record<string, any>;
  }[];

  /** Si role === user, qué médico escribió (user id del sistema de auth). */
  @Prop({ index: true })
  authorDoctorUserId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ tenantId: 1, sessionId: 1, createdAt: 1 });
