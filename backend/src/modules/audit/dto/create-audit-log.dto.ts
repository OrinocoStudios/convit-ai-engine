import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  clinicalHistoryId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
