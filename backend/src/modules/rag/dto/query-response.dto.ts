export interface RagSource {
  content: string;
  source: string;
  documentId?: string;
  scope: string;
  metadata?: Record<string, any>;
}

export class QueryResponseDto {
  answer: string;
  sources: RagSource[];
}
