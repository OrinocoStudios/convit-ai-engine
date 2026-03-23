import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClinicalHistoryDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
