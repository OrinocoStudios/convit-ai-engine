import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayUnique } from 'class-validator';

export class CreateChatSessionDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsOptional()
  @IsString()
  clinicalHistoryId?: string;

  /** Otros médicos asociados además del creador (header `x-doctor-user-id`). */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  additionalDoctorUserIds?: string[];
}
