import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RagModule } from './modules/rag/rag.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuditModule } from './modules/audit/audit.module';
import { ClinicalHistoriesModule } from './modules/clinical-histories/clinical-histories.module';
import { StorageModule } from './modules/storage/storage.module';
import { ChatSummariesModule } from './modules/chat-summaries/chat-summaries.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGO_URI',
          'mongodb://localhost:27017/convit',
        ),
      }),
    }),
    AuthModule,
    PatientsModule,
    DocumentsModule,
    RagModule,
    ChatModule,
    AuditModule,
    ClinicalHistoriesModule,
    StorageModule,
    ChatSummariesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
