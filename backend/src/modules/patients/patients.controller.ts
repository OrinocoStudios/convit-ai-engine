import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() dto: CreatePatientDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.patientsService.create(tenantId.trim(), dto);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string | undefined) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.patientsService.findByTenant(tenantId.trim());
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id') id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.patientsService.findOne(tenantId.trim(), id);
  }
}
