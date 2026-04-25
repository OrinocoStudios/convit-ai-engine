import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { BrainHealthService } from './brain-health.service';

describe('BrainHealthService', () => {
  const fetchMock = vi.fn();
  const config = {
    get: vi.fn((key: string, def?: string) => {
      if (key === 'BRAIN_SERVICE_URL') return 'http://brain:8081';
      if (key === 'BRAIN_SERVICE_API_KEY') return 'k';
      return def;
    }),
  } as unknown as ConfigService;

  let service: BrainHealthService;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    service = new BrainHealthService(config);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ok cuando Pinky responde 200 y status ok', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    });

    const r = await service.ping();
    expect(r.ok).toBe(true);
    expect(r.status).toBe('up');
    expect(r.serviceStatus).toBe('ok');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://brain:8081/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          accept: 'application/json',
          'X-API-Key': 'k',
        }),
      }),
    );
  });

  it('degraded cuando body.status es degraded', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'degraded' }),
    });

    const r = await service.ping();
    expect(r.ok).toBe(true);
    expect(r.status).toBe('degraded');
  });

  it('error cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const r = await service.ping();
    expect(r.ok).toBe(false);
    expect(r.status).toBe('error');
  });
});
