import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, dto: CreatePatientDto) {
    const patient = await this.patientModel.create({ tenantId, name: dto.name });
    await this.auditService.log({
      tenantId,
      action: 'PATIENT_CREATE',
      patientId: patient._id.toString(),
      metadata: { name: patient.name },
    });
    return patient;
  }

  async findByTenant(tenantId: string) {
    return this.patientModel.find({ tenantId }).sort({ name: 1 }).lean().exec();
  }

  async findOne(tenantId: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Patient not found');
    }
    const doc = await this.patientModel.findOne({ _id: id, tenantId }).lean().exec();
    if (!doc) {
      throw new NotFoundException('Patient not found');
    }
    return doc;
  }
}
