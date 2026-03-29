import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  /** Liveness: proceso en ejecución (sin comprobar dependencias). */
  @Get()
  liveness() {
    return { status: 'ok' as const };
  }

  /** Readiness: MongoDB conectado. */
  @Get('ready')
  readiness() {
    if (this.connection.readyState !== mongoose.ConnectionStates.connected) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        mongo: 'disconnected',
      });
    }
    return { status: 'ready' as const, mongo: 'connected' as const };
  }
}
