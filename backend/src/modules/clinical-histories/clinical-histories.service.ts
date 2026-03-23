import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ClinicalHistory, ClinicalHistoryDocument } from './schemas/clinical-history.schema';
import { CreateClinicalHistoryDto } from './dto/create-clinical-history.dto';

@Injectable()
export class ClinicalHistoriesService {
  constructor(
    @InjectModel(ClinicalHistory.name)
    private readonly clinicalHistoryModel: Model<ClinicalHistoryDocument>,
  ) {}

  async create(tenantId: string, doctorId: string, dto: CreateClinicalHistoryDto) {
    return this.clinicalHistoryModel.create({
      tenantId,
      patientId: dto.patientId,
      openedBy: doctorId,
      title: dto.title,
    });
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
