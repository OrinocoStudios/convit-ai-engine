import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { ChatSession, ChatSessionDocument } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { RagService } from '../rag/rag.service';
import { RagScope } from '../rag/dto/query-request.dto';
import { AuditService } from '../audit/audit.service';

/** Respuesta segura para clientes: sin `patientId`. */
export type AnonymousChatSessionView = {
  anonymousPublicId: string;
  doctorUserIds: string[];
  primaryDoctorUserId: string;
  clinicalHistoryId?: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatSession.name)
    private readonly sessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
    private readonly ragService: RagService,
    private readonly auditService: AuditService,
  ) {}

  async createSession(
    tenantId: string,
    primaryDoctorUserId: string,
    dto: CreateChatSessionDto,
  ): Promise<AnonymousChatSessionView> {
    const additional = dto.additionalDoctorUserIds ?? [];
    const doctorUserIds = [
      primaryDoctorUserId,
      ...additional.filter((id) => id !== primaryDoctorUserId),
    ];
    const unique = [...new Set(doctorUserIds)];

    const doc = await this.sessionModel.create({
      tenantId,
      anonymousPublicId: randomUUID(),
      doctorUserIds: unique,
      primaryDoctorUserId,
      patientId: dto.patientId,
      clinicalHistoryId: dto.clinicalHistoryId,
    });

    await this.auditService.log({
      tenantId,
      action: 'CHAT_SESSION_CREATE',
      patientId: dto.patientId,
      clinicalHistoryId: dto.clinicalHistoryId,
      userId: primaryDoctorUserId,
    });

    return this.toAnonymousSessionView(doc);
  }

  async appendMessage(
    tenantId: string,
    anonymousPublicId: string,
    dto: CreateChatMessageDto,
  ): Promise<{ id: string }> {
    const session = await this.sessionModel.findOne({
      tenantId,
      anonymousPublicId,
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    if (dto.role === 'user') {
      if (!dto.authorDoctorUserId) {
        throw new BadRequestException(
          'authorDoctorUserId is required when role is user',
        );
      }
      if (!session.doctorUserIds.includes(dto.authorDoctorUserId)) {
        throw new BadRequestException(
          'authorDoctorUserId must be one of the session doctors',
        );
      }
    }

    const msg = await this.messageModel.create({
      tenantId,
      sessionId: session._id,
      sessionAnonymousPublicId: session.anonymousPublicId,
      role: dto.role,
      content: dto.content,
      authorDoctorUserId:
        dto.role === 'user' ? dto.authorDoctorUserId : undefined,
    });

    // Si es un mensaje del usuario, disparamos la respuesta de la IA
    if (dto.role === 'user') {
      // Loggear el mensaje del usuario en auditoría
      await this.auditService.log({
        tenantId,
        action: 'CHAT_MESSAGE_USER',
        patientId: session.patientId,
        clinicalHistoryId: session.clinicalHistoryId,
        userId: dto.authorDoctorUserId,
        metadata: { messageId: msg._id.toString() },
      });

      try {
        const scopes: RagScope[] = [RagScope.GLOBAL_LIBRARY];
        if (session.patientId) scopes.push(RagScope.PATIENT_DOCUMENT);
        if (session.clinicalHistoryId) scopes.push(RagScope.CLINICAL_HISTORY);

        const ragResponse = await this.ragService.query({
          query: dto.content,
          tenantId,
          patientId: session.patientId,
          clinicalHistoryId: session.clinicalHistoryId,
          scopes,
        });

        const assistantMsg = await this.messageModel.create({
          tenantId,
          sessionId: session._id,
          sessionAnonymousPublicId: session.anonymousPublicId,
          role: 'assistant',
          content: ragResponse.answer,
          sources: ragResponse.sources,
        });

        await this.auditService.log({
          tenantId,
          action: 'CHAT_MESSAGE_ASSISTANT',
          patientId: session.patientId,
          clinicalHistoryId: session.clinicalHistoryId,
          metadata: {
            messageId: assistantMsg._id.toString(),
            sourceCount: ragResponse.sources?.length ?? 0,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to get IA response: ${error.message}`);
        
        await this.messageModel.create({
          tenantId,
          sessionId: session._id,
          sessionAnonymousPublicId: session.anonymousPublicId,
          role: 'assistant',
          content: 'Lo siento, no he podido conectar con mi cerebro en este momento. Por favor, inténtalo de nuevo más tarde.',
        });

        await this.auditService.log({
          tenantId,
          action: 'CHAT_ERROR_RAG',
          patientId: session.patientId,
          clinicalHistoryId: session.clinicalHistoryId,
          metadata: { error: error.message },
        });
      }
    }

    return { id: msg._id.toString() };
  }

  async getSessionAnonymous(
    tenantId: string,
    anonymousPublicId: string,
  ): Promise<AnonymousChatSessionView> {
    const session = await this.sessionModel.findOne({
      tenantId,
      anonymousPublicId,
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    return this.toAnonymousSessionView(session);
  }

  async listMessagesForSession(
    tenantId: string,
    anonymousPublicId: string,
  ): Promise<
    {
      role: ChatMessage['role'];
      content: string;
      authorDoctorUserId?: string;
      createdAt: Date;
      updatedAt: Date;
    }[]
  > {
    const session = await this.sessionModel.findOne({
      tenantId,
      anonymousPublicId,
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    const rows = await this.messageModel
      .find({ tenantId, sessionId: session._id })
      .sort({ createdAt: 1 })
      .select('role content authorDoctorUserId createdAt updatedAt')
      .lean()
      .exec();

    return rows.map((r) => ({
      role: r.role,
      content: r.content,
      authorDoctorUserId: r.authorDoctorUserId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  private toAnonymousSessionView(
    doc: ChatSessionDocument,
  ): AnonymousChatSessionView {
    return {
      anonymousPublicId: doc.anonymousPublicId,
      doctorUserIds: doc.doctorUserIds,
      primaryDoctorUserId: doc.primaryDoctorUserId,
      clinicalHistoryId: doc.clinicalHistoryId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
