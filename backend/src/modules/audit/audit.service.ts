import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export type AuditLogEntry = {
  tenantId: string;
  action: string;
  patientId?: string;
  clinicalHistoryId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async log(entry: AuditLogEntry) {
    return this.auditModel.create({
      tenantId: entry.tenantId,
      action: entry.action,
      patientId: entry.patientId,
      clinicalHistoryId: entry.clinicalHistoryId,
      userId: entry.userId,
      metadata: entry.metadata,
    });
  }

  async findAll(tenantId: string) {
    return this.auditModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
