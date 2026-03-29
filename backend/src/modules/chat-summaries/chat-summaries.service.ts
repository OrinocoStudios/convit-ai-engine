import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatSummary,
  ChatSummaryDocument,
} from './schemas/chat-summary.schema';
import { CreateChatSummaryDto } from './dto/create-chat-summary.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ChatSummariesService {
  constructor(
    @InjectModel(ChatSummary.name)
    private readonly summaryModel: Model<ChatSummaryDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    doctorUserId: string,
    dto: CreateChatSummaryDto,
  ) {
    const summary = await this.summaryModel.create({
      tenantId,
      ...dto,
    });

    await this.auditService.log({
      action: 'CREATE_CHAT_SUMMARY',
      tenantId,
      userId: doctorUserId,
      patientId: dto.patientId,
      clinicalHistoryId: dto.clinicalHistoryId,
      metadata: { summaryId: summary._id.toString(), label: dto.label },
    });

    return summary;
  }

  async findByHistory(tenantId: string, clinicalHistoryId: string) {
    return this.summaryModel
      .find({ tenantId, clinicalHistoryId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findByPatient(tenantId: string, patientId: string) {
    return this.summaryModel
      .find({ tenantId, patientId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
