import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService } from './chat.service';
import { RagScope } from '../rag/dto/query-request.dto';

describe('ChatService', () => {
  let service: ChatService;
  let sessionModel: any;
  let messageModel: any;
  let ragService: any;
  let auditService: any;
  let chatSummariesService: any;

  beforeEach(() => {
    sessionModel = {
      findOne: vi.fn(),
      create: vi.fn(),
    };
    messageModel = {
      find: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn(),
      create: vi.fn(),
    };
    ragService = {
      summarize: vi.fn().mockResolvedValue('Resumen de la IA'),
      ingest: vi.fn().mockResolvedValue(undefined),
      query: vi.fn(),
    };
    auditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    chatSummariesService = {
      create: vi.fn().mockResolvedValue({ _id: 'summary_1' }),
    };

    service = new ChatService(
      sessionModel,
      messageModel,
      ragService,
      auditService,
      chatSummariesService,
    );
  });

  it('closeSession debe orquestar resumen, persistencia e ingesta', async () => {
    const tenantId = 't1';
    const aid = 'session-id';
    const mockSession = {
      _id: 'mongo-id',
      tenantId,
      anonymousPublicId: aid,
      primaryDoctorUserId: 'doc1',
      patientId: 'p1',
      clinicalHistoryId: 'h1',
      doctorUserIds: ['doc1'],
    };
    const mockMessages = [
      { role: 'user', content: 'hola' },
      { role: 'assistant', content: 'que tal' },
    ];

    sessionModel.findOne.mockResolvedValue(mockSession);
    messageModel.exec.mockResolvedValue(mockMessages);

    const result = await service.closeSession(tenantId, aid);

    expect(result.summary).toBe('Resumen de la IA');
    expect(ragService.summarize).toHaveBeenCalled();
    expect(chatSummariesService.create).toHaveBeenCalledWith(
      tenantId,
      'doc1',
      expect.objectContaining({
        patientId: 'p1',
        clinicalHistoryId: 'h1',
        summaryText: 'Resumen de la IA',
      }),
    );
    expect(ragService.ingest).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: RagScope.CLINICAL_HISTORY,
        content: 'Resumen de la IA',
      }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CHAT_SESSION_CLOSE',
      }),
    );
  });

  it('closeSession debe fallar si no hay mensajes', async () => {
    sessionModel.findOne.mockResolvedValue({ _id: 'id' });
    messageModel.exec.mockResolvedValue([]);

    await expect(service.closeSession('t1', 'aid')).rejects.toThrow(
      'Cannot close an empty session',
    );
  });
});
