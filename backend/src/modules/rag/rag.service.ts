import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { SummarizeRequestDto } from './dto/summarize-request.dto';
import { SummarizeResponseDto } from './dto/summarize-response.dto';
import { IngestRequestDto } from './dto/ingest-request.dto';
import { RagScope } from './dto/query-request.dto';
import {
  CLINICAL_DOCUMENT_CATEGORIES,
  type ClinicalDocumentCategory,
} from '../documents/clinical-document.constants';
import {
  ClinicalDocument,
  ClinicalDocumentDocument,
} from '../documents/schemas/clinical-document.schema';

type BrainChunkSource = {
  id: string;
  text: string;
  documentId?: string;
  title?: string;
  libraryId?: string;
  metadata?: Record<string, unknown>;
};

type BrainQueryResponse = {
  answer: string;
  sourcesUsed: string[];
  fastContext: BrainChunkSource[];
  truthFacts: Array<{ id: string; from: string; relation: string; to: string }>;
  model?: string;
  tokensUsed?: number;
  prompt: string;
};

type BrainDocumentResponse = {
  documentId: string;
  libraryId?: string;
  title?: string;
  rawText?: string;
  metadata?: Record<string, unknown>;
};

type BrainUploadDocumentInput = {
  tenantId: string;
  libraryId: string;
  title?: string;
  file: { buffer: Buffer; originalname: string; mimetype: string };
};

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly brainServiceUrl: string;
  private readonly brainServiceApiKey?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(ClinicalDocument.name)
    private readonly documentModel: Model<ClinicalDocumentDocument>,
  ) {
    this.brainServiceUrl = this.configService.get<string>(
      'BRAIN_SERVICE_URL',
      'http://brain-service:8081',
    );
    this.brainServiceApiKey = this.configService.get<string>(
      'BRAIN_SERVICE_API_KEY',
    );
  }

  async query(request: QueryRequestDto): Promise<QueryResponseDto> {
    try {
      const scopes =
        request.scopes?.length ? request.scopes : this.buildDefaultScopes(request);
      const libraryIds = this.buildLibraryIds({
        patientId: request.patientId,
        clinicalHistoryId: request.clinicalHistoryId,
        scopes,
      });

      const { data } = await this.httpService.axiosRef.post<BrainQueryResponse>(
        `${this.brainServiceUrl}/query`,
        {
          query: request.query,
          libraryIds,
          sessionId: request.sessionId,
        },
        {
          headers: this.buildBrainHeaders(request.tenantId),
        },
      );
      const sources = await this.mapBrainSources(request.tenantId, data.fastContext);
      if (sources.length === 0) {
        return {
          answer:
            'No encontré contexto suficiente para responder esta consulta con trazabilidad verificable.',
          sources: [],
        };
      }

      return {
        answer: data.answer,
        sources,
      };
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Error querying Brain Service: ${e.message}`, e.stack);
      throw err;
    }
  }

  async summarize(
    messages: SummarizeRequestDto['messages'],
    sessionId?: string,
    tenantId?: string,
    libraryId?: string,
  ): Promise<string> {
    try {
      const { data } = await this.httpService.axiosRef.post<SummarizeResponseDto>(
        `${this.brainServiceUrl}/summarize`,
        { messages, sessionId, tenantId, libraryId },
        {
          headers: this.buildBrainHeaders(tenantId, libraryId),
        },
      );
      return data.summary;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Error summarizing via Brain Service: ${e.message}`);
      throw err;
    }
  }

  async ingest(request: IngestRequestDto): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `${this.brainServiceUrl}/documents/text`,
        {
          title: this.resolveBrainDocumentTitle(request),
          rawText: request.content,
          metadata: request.metadata,
        },
        {
          headers: this.buildBrainHeaders(
            request.tenantId,
            this.resolveBrainLibraryId(request),
          ),
        },
      );
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Error ingesting to Brain Service: ${e.message}`);
      throw err;
    }
  }

  async uploadDocument(
    input: BrainUploadDocumentInput,
  ): Promise<BrainDocumentResponse> {
    const formData = new FormData();
    const file = new File(
      [new Uint8Array(input.file.buffer)],
      input.file.originalname,
      { type: input.file.mimetype },
    );

    formData.append('file', file);
    if (input.title?.trim()) {
      formData.append('title', input.title.trim());
    }

    const response = await fetch(`${this.brainServiceUrl}/documents/upload`, {
      method: 'POST',
      headers: this.buildBrainHeaders(input.tenantId, input.libraryId),
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Brain Service upload failed (${response.status}): ${errorBody}`,
      );
    }

    return (await response.json()) as BrainDocumentResponse;
  }

  private buildBrainHeaders(tenantId?: string, libraryId?: string) {
    return {
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
      ...(libraryId ? { 'X-Library-Id': libraryId } : {}),
      ...(this.brainServiceApiKey ? { 'X-API-Key': this.brainServiceApiKey } : {}),
    };
  }

  private buildDefaultScopes(request: QueryRequestDto): RagScope[] {
    return [
      RagScope.GLOBAL_LIBRARY,
      ...(request.patientId ? [RagScope.PATIENT_DOCUMENT] : []),
      ...(request.clinicalHistoryId ? [RagScope.CLINICAL_HISTORY] : []),
    ];
  }

  private buildLibraryIds(request: {
    patientId?: string;
    clinicalHistoryId?: string;
    scopes: RagScope[];
  }) {
    const libraryIds = [
      ...(request.scopes.includes(RagScope.GLOBAL_LIBRARY)
        ? CLINICAL_DOCUMENT_CATEGORIES.map((category) => `global:${category}`)
        : []),
      ...(request.patientId &&
      request.scopes.includes(RagScope.PATIENT_DOCUMENT)
        ? CLINICAL_DOCUMENT_CATEGORIES.map(
            (category) => `patient:${request.patientId}:${category}`,
          )
        : []),
      ...(request.clinicalHistoryId &&
      request.scopes.includes(RagScope.CLINICAL_HISTORY)
        ? [`history:${request.clinicalHistoryId}:summary`]
        : []),
    ];

    return [...new Set(libraryIds)];
  }

  private async mapBrainSources(
    tenantId: string,
    sources: BrainChunkSource[],
  ): Promise<QueryResponseDto['sources']> {
    const ragDocumentIds = [
      ...new Set(
        sources
          .map((source) => source.documentId)
          .filter((documentId): documentId is string => Boolean(documentId)),
      ),
    ];
    const localDocuments = ragDocumentIds.length
      ? await this.documentModel
          .find({
            tenantId,
            ragDocumentId: { $in: ragDocumentIds },
          })
          .lean()
          .exec()
      : [];
    const localDocumentByRagId = new Map(
      localDocuments
        .filter((document) => document.ragDocumentId)
        .map((document) => [document.ragDocumentId as string, document]),
    );

    const uniqueSources = new Map<string, QueryResponseDto['sources'][number]>();
    for (const source of sources) {
      const localDocument = source.documentId
        ? localDocumentByRagId.get(source.documentId)
        : undefined;
      const key =
        localDocument?._id?.toString() ??
        source.documentId ??
        `${source.libraryId ?? 'unknown'}:${source.id}`;
      if (uniqueSources.has(key)) {
        continue;
      }

      uniqueSources.set(key, {
        content: source.text,
        source:
          localDocument?.filename ??
          source.title ??
          source.libraryId ??
          'Documento sin título',
        documentId: localDocument?._id?.toString(),
        scope: this.resolveSourceScope(
          localDocument?.ragLibraryId ?? source.libraryId,
        ),
        metadata: {
          ragDocumentId: source.documentId,
          ragLibraryId: localDocument?.ragLibraryId ?? source.libraryId,
          category:
            localDocument?.category ??
            this.resolveCategoryFromLibraryId(source.libraryId),
          filename: localDocument?.filename ?? source.title,
          mimeType: localDocument?.mimeType,
        },
      });
    }

    return [...uniqueSources.values()];
  }

  private resolveSourceScope(libraryId?: string) {
    if (libraryId?.startsWith('patient:')) {
      return RagScope.PATIENT_DOCUMENT;
    }
    if (libraryId?.startsWith('history:')) {
      return 'CHAT_SUMMARY';
    }
    return RagScope.GLOBAL_LIBRARY;
  }

  private resolveCategoryFromLibraryId(
    libraryId?: string,
  ): ClinicalDocumentCategory | undefined {
    const category = libraryId?.split(':').at(-1);
    if (
      category &&
      CLINICAL_DOCUMENT_CATEGORIES.includes(
        category as ClinicalDocumentCategory,
      )
    ) {
      return category as ClinicalDocumentCategory;
    }
    return undefined;
  }

  private resolveBrainLibraryId(request: IngestRequestDto) {
    switch (request.scope) {
      case RagScope.CLINICAL_HISTORY:
        if (!request.clinicalHistoryId) {
          throw new Error(
            'clinicalHistoryId is required for CLINICAL_HISTORY ingestion',
          );
        }
        return `history:${request.clinicalHistoryId}:summary`;
      case RagScope.PATIENT_DOCUMENT:
        if (!request.patientId) {
          throw new Error(
            'patientId is required for PATIENT_DOCUMENT ingestion',
          );
        }
        return `patient:${request.patientId}:${this.resolveIngestCategory(
          request.metadata,
        )}`;
      case RagScope.GLOBAL_LIBRARY:
      default:
        return `global:${this.resolveIngestCategory(request.metadata)}`;
    }
  }

  private resolveIngestCategory(metadata?: Record<string, any>) {
    const category = metadata?.documentCategory;
    if (
      typeof category === 'string' &&
      CLINICAL_DOCUMENT_CATEGORIES.includes(
        category as ClinicalDocumentCategory,
      )
    ) {
      return category as ClinicalDocumentCategory;
    }
    return 'medical_history';
  }

  private resolveBrainDocumentTitle(request: IngestRequestDto) {
    return request.scope === RagScope.CLINICAL_HISTORY
      ? `Resumen clínico ${request.clinicalHistoryId ?? ''}`.trim()
      : 'Documento clínico';
  }
}
