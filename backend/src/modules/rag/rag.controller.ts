import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { QueryRequestDto } from './dto/query-request.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  query(@Body() dto: QueryRequestDto) {
    return this.ragService.query(dto);
  }
}
