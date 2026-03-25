import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateChatSummaryDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  clinicalHistoryId: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  @IsNotEmpty()
  summaryText: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
