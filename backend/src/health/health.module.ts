import { Module } from '@nestjs/common';
import { BrainHealthService } from './brain-health.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [BrainHealthService],
  exports: [BrainHealthService],
})
export class HealthModule {}
