import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BRAIN_HEALTH_TIMEOUT_MS = 5000;

export type BrainPingResult = {
  ok: boolean;
  status: 'up' | 'degraded' | 'error';
  latencyMs: number;
  httpStatus?: number;
  serviceStatus?: string;
  error?: string;
};

@Injectable()
export class BrainHealthService {
  private readonly logger = new Logger(BrainHealthService.name);
  private readonly brainServiceUrl: string;
  private readonly brainServiceApiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.brainServiceUrl = this.configService.get<string>(
      'BRAIN_SERVICE_URL',
      'http://brain-service:8081',
    );
    this.brainServiceApiKey = this.configService.get<string>(
      'BRAIN_SERVICE_API_KEY',
    );
  }

  /**
   * GET {BRAIN_SERVICE_URL}/health — público en Pinky; API key solo si hace falta.
   */
  async ping(): Promise<BrainPingResult> {
    const base = this.brainServiceUrl.replace(/\/$/, '');
    const url = `${base}/health`;
    const start = Date.now();
    const headers: Record<string, string> = { accept: 'application/json' };
    if (this.brainServiceApiKey) {
      headers['X-API-Key'] = this.brainServiceApiKey;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), BRAIN_HEALTH_TIMEOUT_MS);
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return {
          ok: false,
          status: 'error',
          latencyMs,
          httpStatus: response.status,
          error: `HTTP ${response.status}`,
        };
      }

      const json = (await response.json()) as { status?: string };
      const serviceStatus = json.status;
      const degraded = serviceStatus === 'degraded';

      return {
        ok: true,
        status: degraded ? 'degraded' : 'up',
        latencyMs,
        httpStatus: response.status,
        serviceStatus,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Brain Service health check failed: ${message}`);
      return {
        ok: false,
        status: 'error',
        latencyMs: Date.now() - start,
        error: message,
      };
    }
  }
}
