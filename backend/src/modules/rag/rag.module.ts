import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import {
  ClinicalDocument,
  ClinicalDocumentSchema,
} from '../documents/schemas/clinical-document.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ClinicalDocument.name, schema: ClinicalDocumentSchema },
    ]),
  ],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
