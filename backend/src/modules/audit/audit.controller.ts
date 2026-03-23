import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string | undefined) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.auditService.findAll(tenantId.trim());
  }

  @Post('logs')
  createLog(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Body() dto: CreateAuditLogDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.auditService.log({
      tenantId: tenantId.trim(),
      action: dto.action,
      patientId: dto.patientId,
      clinicalHistoryId: dto.clinicalHistoryId,
      userId: doctorUserId?.trim() || undefined,
      metadata: dto.metadata,
    });
  }
}
