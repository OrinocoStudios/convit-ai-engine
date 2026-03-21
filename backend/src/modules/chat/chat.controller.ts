import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

/**
 * Cabeceras de contexto (hasta integrar JWT):
 * - `x-tenant-id`: clínica
 * - `x-doctor-user-id`: médico que actúa (creador de sesión o autor de mensaje user)
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Body() dto: CreateChatSessionDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!doctorUserId?.trim()) {
      throw new BadRequestException('Missing header x-doctor-user-id');
    }
    return this.chatService.createSession(
      tenantId.trim(),
      doctorUserId.trim(),
      dto,
    );
  }

  @Get('sessions/:anonymousPublicId')
  getSession(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('anonymousPublicId') anonymousPublicId: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.chatService.getSessionAnonymous(
      tenantId.trim(),
      anonymousPublicId,
    );
  }

  @Get('sessions/:anonymousPublicId/messages')
  listMessages(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('anonymousPublicId') anonymousPublicId: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.chatService.listMessagesForSession(
      tenantId.trim(),
      anonymousPublicId,
    );
  }

  @Post('sessions/:anonymousPublicId/messages')
  appendMessage(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('anonymousPublicId') anonymousPublicId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.chatService.appendMessage(
      tenantId.trim(),
      anonymousPublicId,
      dto,
    );
  }
}
