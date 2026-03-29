import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClinicalHistory,
  ClinicalHistorySchema,
} from './schemas/clinical-history.schema';
import { ClinicalHistoriesService } from './clinical-histories.service';
import { ClinicalHistoriesController } from './clinical-histories.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClinicalHistory.name, schema: ClinicalHistorySchema },
    ]),
    AuditModule,
  ],
  controllers: [ClinicalHistoriesController],
  providers: [ClinicalHistoriesService],
  exports: [ClinicalHistoriesService],
})
export class ClinicalHistoriesModule {}
