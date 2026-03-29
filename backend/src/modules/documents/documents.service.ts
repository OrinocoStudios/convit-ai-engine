import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClinicalDocument,
  ClinicalDocumentDocument,
} from './schemas/clinical-document.schema';
import { CreateClinicalDocumentDto } from './dto/create-clinical-document.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ClinicalDocument.name)
    private readonly documentModel: Model<ClinicalDocumentDocument>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    tenantId: string,
    uploadedBy: string,
    dto: CreateClinicalDocumentDto,
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    if (dto.kind === 'patient' && !dto.patientId?.trim()) {
      throw new BadRequestException(
        'patientId is required when kind is patient',
      );
    }
    if (dto.kind === 'global_library' && dto.patientId) {
      throw new BadRequestException(
        'patientId must not be set when kind is global_library',
      );
    }

    let storageKey = dto.storageKey;
    let mimeType = dto.mimeType;
    let filename = dto.filename;

    if (file) {
      storageKey = await this.storageService.saveFile(tenantId, file);
      mimeType = file.mimetype;
      filename = file.originalname;
    }

    if (!storageKey) {
      throw new BadRequestException('storageKey or file is required');
    }

    return this.documentModel.create({
      tenantId,
      kind: dto.kind,
      patientId: dto.kind === 'patient' ? dto.patientId : undefined,
      uploadedBy,
      filename,
      storageKey,
      mimeType,
    });
  }

  async list(tenantId: string, filters: { kind?: string; patientId?: string }) {
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
