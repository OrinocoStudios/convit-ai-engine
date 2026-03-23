import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ClinicalHistory, ClinicalHistoryDocument } from './schemas/clinical-history.schema';
import { CreateClinicalHistoryDto } from './dto/create-clinical-history.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ClinicalHistoriesService {
  constructor(
    @InjectModel(ClinicalHistory.name)
    private readonly clinicalHistoryModel: Model<ClinicalHistoryDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, doctorId: string, dto: CreateClinicalHistoryDto) {
    const history = await this.clinicalHistoryModel.create({
      tenantId,
      patientId: dto.patientId,
      openedBy: doctorId,
      title: dto.title,
    });
    await this.auditService.log({
      tenantId,
      action: 'HISTORY_CREATE',
      patientId: dto.patientId,
      clinicalHistoryId: history._id.toString(),
      userId: doctorId,
      metadata: { title: dto.title },
    });
    return history;
  }

  async findAllByPatient(tenantId: string, patientId: string) {
    return this.clinicalHistoryModel.find({ tenantId, patientId }).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(tenantId: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Clinical history not found');
    }
    const doc = await this.clinicalHistoryModel.findOne({ _id: id, tenantId }).lean().exec();
    if (!doc) {
      throw new NotFoundException('Clinical history not found');
    }
    return doc;
  }
}
