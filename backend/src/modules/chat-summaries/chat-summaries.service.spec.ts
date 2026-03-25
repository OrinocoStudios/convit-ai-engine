import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatSummariesService } from './chat-summaries.service';
import { AuditService } from '../audit/audit.service';

describe('ChatSummariesService', () => {
  let service: ChatSummariesService;
  let summaryModel: any;
  let auditService: AuditService;

  beforeEach(() => {
    summaryModel = {
      create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, _id: 'mock_id' })),
      find: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };
    auditService = {
      log: vi.fn().mockResolvedValue(undefined),
    } as any;

    service = new ChatSummariesService(summaryModel, auditService);
  });

  it('debe crear un resumen y registrarlo en auditoria', async () => {
    const dto = {
      patientId: 'p1',
      clinicalHistoryId: 'h1',
      summaryText: 'Resumen de prueba',
      label: 'Chat 1',
    };
    const tenantId = 't1';
    const userId = 'u1';

    const result = await service.create(tenantId, userId, dto);

    expect(result).toBeDefined();
    expect(summaryModel.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId,
      summaryText: 'Resumen de prueba',
    }));
    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'CREATE_CHAT_SUMMARY',
      tenantId,
      userId,
    }));
  });

  it('debe buscar por historia clínica', async () => {
    await service.findByHistory('t1', 'h1');
    expect(summaryModel.find).toHaveBeenCalledWith({ tenantId: 't1', clinicalHistoryId: 'h1' });
  });

  it('debe buscar por paciente', async () => {
    await service.findByPatient('t1', 'p1');
    expect(summaryModel.find).toHaveBeenCalledWith({ tenantId: 't1', patientId: 'p1' });
  });
});
