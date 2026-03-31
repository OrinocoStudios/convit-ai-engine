export class SummarizeRequestDto {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];

  sessionId?: string;
  tenantId?: string;
  libraryId?: string;
}
