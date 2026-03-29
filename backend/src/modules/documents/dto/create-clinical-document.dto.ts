import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import type { ClinicalDocumentKind } from '../schemas/clinical-document.schema';

export class CreateClinicalDocumentDto {
  @IsEnum(['global_library', 'patient'])
  kind: ClinicalDocumentKind;

  @ValidateIf((o: CreateClinicalDocumentDto) => o.kind === 'patient')
  @IsString()
  @IsNotEmpty()
  patientId?: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
