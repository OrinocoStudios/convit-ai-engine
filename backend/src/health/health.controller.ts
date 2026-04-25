import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { BrainHealthService } from './brain-health.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly brainHealth: BrainHealthService,
  ) {}

  /** Liveness: proceso en ejecución (sin comprobar dependencias). */
  @Get()
  liveness() {
    return { status: 'ok' as const };
  }

  /** Readiness: MongoDB conectado y Brain Service alcanzable. */
  @Get('ready')
  async readiness() {
    if (this.connection.readyState !== mongoose.ConnectionStates.connected) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        mongo: 'disconnected',
        brain: 'unknown',
      });
    }

    const brain = await this.brainHealth.ping();
    if (!brain.ok) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        mongo: 'connected',
        brain: 'unavailable',
        detail: brain.error,
        brainHttpStatus: brain.httpStatus,
      });
    }

    return {
      status: 'ready' as const,
      mongo: 'connected' as const,
      brain: brain.status,
      brainLatencyMs: brain.latencyMs,
      brainServiceStatus: brain.serviceStatus,
    };
  }
}
