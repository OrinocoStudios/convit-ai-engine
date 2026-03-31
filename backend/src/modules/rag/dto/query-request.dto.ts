import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum RagScope {
  GLOBAL_LIBRARY = 'GLOBAL_LIBRARY',
  PATIENT_DOCUMENT = 'PATIENT_DOCUMENT',
  CLINICAL_HISTORY = 'CLINICAL_HISTORY',
}

export class QueryRequestDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  clinicalHistoryId?: string;

  @IsArray()
  @IsEnum(RagScope, { each: true })
  @IsOptional()
  scopes?: RagScope[];

  @IsString()
  @IsOptional()
  sessionId?: string;
}
