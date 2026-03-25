import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSummariesController } from './chat-summaries.controller';
import { ChatSummariesService } from './chat-summaries.service';
import { ChatSummary, ChatSummarySchema } from './schemas/chat-summary.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSummary.name, schema: ChatSummarySchema },
    ]),
    AuditModule,
  ],
  controllers: [ChatSummariesController],
  providers: [ChatSummariesService],
  exports: [ChatSummariesService],
})
export class ChatSummariesModule {}
