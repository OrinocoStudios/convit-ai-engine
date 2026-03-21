import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClinicalDocument,
  ClinicalDocumentDocument,
} from './schemas/clinical-document.schema';
import { CreateClinicalDocumentDto } from './dto/create-clinical-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ClinicalDocument.name)
    private readonly documentModel: Model<ClinicalDocumentDocument>,
  ) {}

  async create(
    tenantId: string,
    uploadedBy: string,
    dto: CreateClinicalDocumentDto,
  ) {
    if (dto.kind === 'patient' && !dto.patientId?.trim()) {
      throw new BadRequestException('patientId is required when kind is patient');
    }
    if (dto.kind === 'global_library' && dto.patientId) {
      throw new BadRequestException(
        'patientId must not be set when kind is global_library',
      );
    }
    return this.documentModel.create({
      tenantId,
      kind: dto.kind,
      patientId: dto.kind === 'patient' ? dto.patientId : undefined,
      uploadedBy,
      filename: dto.filename,
      storageKey: dto.storageKey,
      mimeType: dto.mimeType,
    });
  }

  async list(
    tenantId: string,
    filters: { kind?: string; patientId?: string },
  ) {
    const q: Record<string, unknown> = { tenantId };
    if (filters.kind) {
      q.kind = filters.kind;
    }
    if (filters.patientId) {
      q.patientId = filters.patientId;
    }
    return this.documentModel.find(q).sort({ createdAt: -1 }).lean().exec();
  }
}
