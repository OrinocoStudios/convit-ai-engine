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
      create: vi.fn().mockImplementation((input: { role: string }) => {
        if (input.role === 'assistant') {
          return Promise.resolve({ _id: 'asst_1' });
        }
        return Promise.resolve({ _id: 'user_1' });
      }),
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

  it('closeSession con lista vacía devuelve summary vacío sin llamar summarize', async () => {
    sessionModel.findOne.mockResolvedValue({ _id: 'id' });
    messageModel.exec.mockResolvedValue([]);

    const out = await service.closeSession('t1', 'aid');
    expect(out).toEqual({ summary: '' });
    expect(ragService.summarize).not.toHaveBeenCalled();
  });

  it('appendMessage usuario dispara RAG y persiste assistant con sources', async () => {
    const mockSession = {
      _id: 'mongo-s1',
      tenantId: 't1',
      anonymousPublicId: 'aid-1',
      doctorUserIds: ['d1'],
      primaryDoctorUserId: 'd1',
      patientId: 'p1',
      clinicalHistoryId: 'h1',
    };
    sessionModel.findOne.mockResolvedValue(mockSession);
    ragService.query.mockResolvedValue({
      answer: 'Respuesta con fuente',
      sources: [
        {
          content: 'cita',
          source: 'doc.pdf',
          scope: 'GLOBAL_LIBRARY',
        },
      ],
    });

    const out = await service.appendMessage('t1', 'aid-1', {
      role: 'user',
      content: 'Hola',
      authorDoctorUserId: 'd1',
    });

    expect(out.id).toBe('user_1');
    expect(ragService.query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'Hola',
        tenantId: 't1',
        patientId: 'p1',
        clinicalHistoryId: 'h1',
        sessionId: 'aid-1',
        scopes: expect.arrayContaining([RagScope.GLOBAL_LIBRARY]),
      }),
    );
    expect(messageModel.create).toHaveBeenCalled();
    const assistantCall = (messageModel.create as ReturnType<typeof vi.fn>).mock
      .calls[1];
    expect(assistantCall[0].role).toBe('assistant');
    expect(assistantCall[0].content).toBe('Respuesta con fuente');
    expect(assistantCall[0].sources).toEqual([
      expect.objectContaining({ source: 'doc.pdf' }),
    ]);
  });
});
