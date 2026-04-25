import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RagService } from './rag.service';
import { RagScope } from './dto/query-request.dto';

describe('RagService', () => {
  let service: RagService;
  let httpService: { axiosRef: { post: ReturnType<typeof vi.fn> } };
  let configService: { get: ReturnType<typeof vi.fn> };
  let documentModel: { find: ReturnType<typeof vi.fn> };

  function mockQueryResponse(data: {
    answer: string;
    fastContext: Array<{
      id: string;
      text: string;
      documentId?: string;
      title?: string;
      libraryId?: string;
    }>;
    truthFacts: Array<{
      id: string;
      from: string;
      relation: string;
      to: string;
    }>;
  }) {
    httpService.axiosRef.post.mockResolvedValue({
      data: {
        answer: data.answer,
        sourcesUsed: [],
        fastContext: data.fastContext,
        truthFacts: data.truthFacts,
        prompt: 'prompt',
      },
    });
  }

  beforeEach(() => {
    httpService = { axiosRef: { post: vi.fn() } };
    configService = {
      get: vi.fn((key: string, def?: string) => {
        if (key === 'BRAIN_SERVICE_URL') return 'http://brain:8081';
        if (key === 'BRAIN_SERVICE_API_KEY') return 'test-api-key';
        return def;
      }),
    };
    documentModel = {
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    service = new RagService(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
      documentModel as any,
    );
  });

  it('POST /query con tenant, libraryIds, sessionId y header X-API-Key', async () => {
    mockQueryResponse({
      answer: 'R1',
      fastContext: [
        {
          id: 'chunk-1',
          text: 'contexto',
          title: 'Doc',
          libraryId: 'global:medical_history',
        },
      ],
      truthFacts: [],
    });

    const result = await service.query({
      query: 'pregunta',
      tenantId: 'tenant-1',
      patientId: 'p1',
      clinicalHistoryId: 'h1',
      scopes: [
        RagScope.GLOBAL_LIBRARY,
        RagScope.PATIENT_DOCUMENT,
        RagScope.CLINICAL_HISTORY,
      ],
      sessionId: 'sess-1',
    });

    expect(httpService.axiosRef.post).toHaveBeenCalledWith(
      'http://brain:8081/query',
      expect.objectContaining({
        query: 'pregunta',
        sessionId: 'sess-1',
        libraryIds: expect.arrayContaining([
          'global:medical_history',
          'global:medical_consultation',
          'patient:p1:medical_history',
          'patient:p1:medical_consultation',
          'history:h1:summary',
        ]),
      }),
      {
        headers: {
          'X-Tenant-Id': 'tenant-1',
          'X-API-Key': 'test-api-key',
        },
      },
    );
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.answer).toBe('R1');
  });

  it('usa truthFacts si fastContext vacío (trazabilidad grafo)', async () => {
    mockQueryResponse({
      answer: 'R2',
      fastContext: [],
      truthFacts: [
        { id: 'f1', from: 'Diabetes', relation: 'afecta_a', to: 'riñón' },
      ],
    });

    const result = await service.query({
      query: 'q',
      tenantId: 't2',
    });

    expect(result.sources).toEqual([
      expect.objectContaining({
        content: 'Diabetes — afecta_a — riñón',
        source: 'Grafo (truthFacts)',
        scope: 'GRAPH_FACT',
        metadata: { factId: 'f1' },
      }),
    ]);
    expect(result.answer).toBe('R2');
  });

  it('responde mensaje fijo si no hay chunks ni truthFacts', async () => {
    mockQueryResponse({ answer: 'x', fastContext: [], truthFacts: [] });

    const result = await service.query({
      query: 'q',
      tenantId: 't3',
    });

    expect(result.sources).toEqual([]);
    expect(result.answer).toMatch(/contexto suficiente/);
  });
});
