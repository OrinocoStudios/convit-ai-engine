import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateClinicalDocumentDto } from './dto/create-clinical-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Body() dto: CreateClinicalDocumentDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!doctorUserId?.trim()) {
      throw new BadRequestException('Missing header x-doctor-user-id');
    }
    return this.documentsService.create(
      tenantId.trim(),
      doctorUserId.trim(),
      dto,
    );
  }

  @Get()
  list(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('kind') kind?: string,
    @Query('patientId') patientId?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.documentsService.list(tenantId.trim(), { kind, patientId });
  }
}
