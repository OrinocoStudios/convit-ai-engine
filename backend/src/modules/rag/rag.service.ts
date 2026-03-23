import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';

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
}
