import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryRequestDto, RagScope } from './dto/query-request.dto';
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
    this.brainServiceUrl = this.configService.get<string>('BRAIN_SERVICE_URL', 'http://brain-service:8000');
  }

  async query(request: QueryRequestDto): Promise<QueryResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<QueryResponseDto>(`${this.brainServiceUrl}/query`, request),
      );
      return data;
    } catch (error) {
      this.logger.error(`Error querying Brain Service: ${error.message}`, error.stack);
      throw error;
    }
  }

  async summarize(messages: SummarizeRequestDto['messages']): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<SummarizeResponseDto>(`${this.brainServiceUrl}/summarize`, { messages }),
      );
      return data.summary;
    } catch (error) {
      this.logger.error(`Error summarizing via Brain Service: ${error.message}`);
      throw error;
    }
  }

  async ingest(request: IngestRequestDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.brainServiceUrl}/ingest`, request),
      );
    } catch (error) {
      this.logger.error(`Error ingesting to Brain Service: ${error.message}`);
      throw error;
    }
  }
}
