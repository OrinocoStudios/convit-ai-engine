import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import {
  ClinicalDocument,
  ClinicalDocumentSchema,
} from './schemas/clinical-document.schema';
import { StorageModule } from '../storage/storage.module';
import { RagModule } from '../rag/rag.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClinicalDocument.name, schema: ClinicalDocumentSchema },
    ]),
    StorageModule,
    RagModule,
    AuditModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService, MongooseModule],
})
export class DocumentsModule {}
