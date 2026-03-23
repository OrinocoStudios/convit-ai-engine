import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  /** At least one of dni or ssn must be provided. */
  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  ssn?: string;
}
