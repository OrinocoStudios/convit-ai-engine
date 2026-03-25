import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { RagModule } from '../rag/rag.module';
import { AuditModule } from '../audit/audit.module';
import { ChatSummariesModule } from '../chat-summaries/chat-summaries.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    RagModule,
    AuditModule,
    ChatSummariesModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService, MongooseModule],
})
export class ChatModule {}
