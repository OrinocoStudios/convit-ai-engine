import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ClinicalHistoriesService } from './clinical-histories.service';
import { CreateClinicalHistoryDto } from './dto/create-clinical-history.dto';

@Controller('clinical-histories')
export class ClinicalHistoriesController {
  constructor(
    private readonly clinicalHistoriesService: ClinicalHistoriesService,
  ) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorId: string | undefined,
    @Body() dto: CreateClinicalHistoryDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!doctorId?.trim()) {
      throw new BadRequestException('Missing header x-doctor-user-id');
    }
    return this.clinicalHistoriesService.create(
      tenantId.trim(),
      doctorId.trim(),
      dto,
    );
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('patientId') patientId: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!patientId?.trim()) {
      throw new BadRequestException('Missing query parameter patientId');
    }
    return this.clinicalHistoriesService.findAllByPatient(
      tenantId.trim(),
      patientId.trim(),
    );
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.clinicalHistoriesService.findOne(tenantId.trim(), id);
  }
}
