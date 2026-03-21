import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  /** Obligatorio si role es `user` (médico que escribe). */
  @IsOptional()
  @IsString()
  authorDoctorUserId?: string;
}
