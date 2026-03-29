import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  CLINICAL_DOCUMENT_CATEGORIES,
  type ClinicalDocumentCategory,
} from '../clinical-document.constants';
import type { ClinicalDocumentKind } from '../schemas/clinical-document.schema';

export class CreateClinicalDocumentDto {
  @IsIn(['global_library', 'patient'])
  kind: ClinicalDocumentKind;

  @ValidateIf((o: CreateClinicalDocumentDto) => o.kind === 'patient')
  @IsString()
  @IsNotEmpty()
  patientId?: string;
  @IsIn(CLINICAL_DOCUMENT_CATEGORIES)
  category: ClinicalDocumentCategory;

  @IsString()
  @IsOptional()
  filename: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
