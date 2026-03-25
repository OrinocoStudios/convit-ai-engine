import { RagScope } from './query-request.dto';

export class IngestRequestDto {
  tenantId: string;
  patientId?: string;
  clinicalHistoryId?: string;
  content: string;
  scope: RagScope;
  metadata?: Record<string, any>;
}
