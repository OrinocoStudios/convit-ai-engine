import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!dto.dni?.trim() && !dto.ssn?.trim()) {
      throw new BadRequestException('At least one of DNI or SSN is required');
    }

    const patient = await this.patientModel.create({
      tenantId,
      name: dto.name,
      dni: dto.dni?.trim() || undefined,
      ssn: dto.ssn?.trim() || undefined,
    });

    await this.auditService.log({
      tenantId,
      action: 'PATIENT_CREATE',
      patientId: patient._id.toString(),
      metadata: { name: patient.name, dni: patient.dni, ssn: patient.ssn },
    });
    return patient;
  }

  async searchByIdentity(tenantId: string, identity: string) {
    const term = identity.trim();
    if (!term) return null;

    // Búsqueda exacta por DNI o SSN
    return this.patientModel
      .findOne({
        tenantId,
        $or: [{ dni: term }, { ssn: term }],
      })
      .lean()
      .exec();
  }

  async findByTenant(tenantId: string) {
    return this.patientModel.find({ tenantId }).sort({ name: 1 }).lean().exec();
  }

  async findOne(tenantId: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Patient not found');
    }
    const doc = await this.patientModel
      .findOne({ _id: id, tenantId })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Patient not found');
    }
    return doc;
  }
}
