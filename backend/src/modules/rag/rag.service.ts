import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { SummarizeRequestDto } from './dto/summarize-request.dto';
import { SummarizeResponseDto } from './dto/summarize-response.dto';
import { IngestRequestDto } from './dto/ingest-request.dto';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly brainServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.brainServiceUrl = this.configService.get<string>(
      'BRAIN_SERVICE_URL',
      'http://brain-service:8000',
    );
  }

  async query(request: QueryRequestDto): Promise<QueryResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<QueryResponseDto>(
          `${this.brainServiceUrl}/query`,
          request,
        ),
      );
      return data;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Error querying Brain Service: ${e.message}`, e.stack);
      throw err;
    }
  }

  async summarize(messages: SummarizeRequestDto['messages']): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<SummarizeResponseDto>(
          `${this.brainServiceUrl}/summarize`,
          { messages },
        ),
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
      await firstValueFrom(
        this.httpService.post(`${this.brainServiceUrl}/ingest`, request),
      );
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Error ingesting to Brain Service: ${e.message}`);
      throw err;
    }
  }
}
