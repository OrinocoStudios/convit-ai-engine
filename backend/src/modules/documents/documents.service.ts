import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  ClinicalDocument,
  ClinicalDocumentDocument,
} from './schemas/clinical-document.schema';
import { CreateClinicalDocumentDto } from './dto/create-clinical-document.dto';
import { StorageService } from '../storage/storage.service';
import { RagService } from '../rag/rag.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ClinicalDocument.name)
    private readonly documentModel: Model<ClinicalDocumentDocument>,
    private readonly storageService: StorageService,
    private readonly ragService: RagService,
    private readonly auditService: AuditService,
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
    let filename = dto.filename?.trim();
    let ragDocumentId: string | undefined;
    let ragLibraryId: string | undefined;
    let extractedText: string | undefined;

    if (file) {
      storageKey = await this.storageService.saveFile(tenantId, file);
      mimeType = file.mimetype;
      filename = file.originalname;

      try {
        const brainDocument = await this.ragService.uploadDocument({
          tenantId,
          libraryId: this.buildRagLibraryId(dto),
          title: file.originalname,
          file,
        });
        ragDocumentId = brainDocument.documentId;
        ragLibraryId = brainDocument.libraryId;
        extractedText = brainDocument.rawText;
      } catch (error) {
        await this.storageService.deleteFile(storageKey);
        throw error;
      }
    }

    if (!storageKey || !filename) {
      throw new BadRequestException('storageKey or file is required');
    }
    const document = await this.documentModel.create({
      tenantId,
      kind: dto.kind,
      patientId: dto.kind === 'patient' ? dto.patientId : undefined,
      category: dto.category,
      uploadedBy,
      filename,
      storageKey,
      mimeType,
      ragDocumentId,
      ragLibraryId,
      extractedText,
    });

    await this.auditService.log({
      tenantId,
      action: 'DOCUMENT_UPLOAD',
      patientId: dto.patientId,
      userId: uploadedBy,
      metadata: {
        documentId: document._id.toString(),
        filename: document.filename,
        category: document.category,
        kind: document.kind,
        ragDocumentId: document.ragDocumentId,
      },
    });

    return document;
  }

  async list(
    tenantId: string,
    filters: { kind?: string; patientId?: string; category?: string },
  ) {
    const q: Record<string, unknown> = { tenantId };
    if (filters.kind) {
      q.kind = filters.kind;
    }
    if (filters.patientId) {
      q.patientId = filters.patientId;
    }
    if (filters.category) {
      q.category = filters.category;
    }
    return this.documentModel
      .find(q)
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(tenantId: string, id: string, doctorUserId?: string) {
    const document = await this.findDocumentEntity(tenantId, id);

    await this.auditService.log({
      tenantId,
      action: 'DOCUMENT_VIEW',
      patientId: document.patientId,
      userId: doctorUserId,
      metadata: {
        documentId: document._id.toString(),
        filename: document.filename,
        category: document.category,
      },
    });

    return document.toObject();
  }

  async getFileDownload(tenantId: string, id: string, doctorUserId?: string) {
    const document = await this.findDocumentEntity(tenantId, id);
    if (!document.storageKey) {
      throw new NotFoundException('Document file not found');
    }

    await this.auditService.log({
      tenantId,
      action: 'DOCUMENT_DOWNLOAD',
      patientId: document.patientId,
      userId: doctorUserId,
      metadata: {
        documentId: document._id.toString(),
        filename: document.filename,
        category: document.category,
      },
    });
    return {
      buffer: await this.storageService.getFile(document.storageKey),
      filename: document.filename,
      mimeType: document.mimeType,
    };
  }

  private async findDocumentEntity(tenantId: string, id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Document not found');
    }

    const document = await this.documentModel.findOne({ _id: id, tenantId });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  private buildRagLibraryId(dto: CreateClinicalDocumentDto) {
    if (dto.kind === 'patient') {
      return `patient:${dto.patientId}:${dto.category}`;
    }
    return `global:${dto.category}`;
  }
}
