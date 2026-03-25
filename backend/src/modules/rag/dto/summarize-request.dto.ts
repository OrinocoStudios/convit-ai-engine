export class SummarizeRequestDto {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
}
