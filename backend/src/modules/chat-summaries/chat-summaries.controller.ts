import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { ChatSummariesService } from './chat-summaries.service';
import { CreateChatSummaryDto } from './dto/create-chat-summary.dto';

@Controller('chat-summaries')
export class ChatSummariesController {
  constructor(private readonly chatSummariesService: ChatSummariesService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Body() dto: CreateChatSummaryDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!doctorUserId?.trim()) {
      throw new BadRequestException('Missing header x-doctor-user-id');
    }
    return this.chatSummariesService.create(
      tenantId.trim(),
      doctorUserId.trim(),
      dto,
    );
  }

  @Get()
  list(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('clinicalHistoryId') clinicalHistoryId?: string,
    @Query('patientId') patientId?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    
    if (clinicalHistoryId) {
      return this.chatSummariesService.findByHistory(tenantId.trim(), clinicalHistoryId);
    }
    if (patientId) {
      return this.chatSummariesService.findByPatient(tenantId.trim(), patientId);
    }

    throw new BadRequestException('Either clinicalHistoryId or patientId must be provided');
  }
}
