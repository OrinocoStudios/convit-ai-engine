import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('StorageService', () => {
  let service: StorageService;
  const storagePath = path.join(__dirname, 'test-storage-unit');

  beforeEach(() => {
    const configService = {
      get: (key: string, defaultValue: string) => {
        if (key === 'STORAGE_BASE_PATH') return storagePath;
        return defaultValue;
      },
    } as unknown as ConfigService;

    service = new StorageService(configService);
  });

  afterEach(async () => {
    await fs
      .rm(storagePath, { recursive: true, force: true })
      .catch(() => undefined);
  });

  it('debe guardar un archivo y devolver el storageKey', async () => {
    const tenantId = 't1';
    const file = {
      buffer: Buffer.from('unit test data'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
    };

    const storageKey = await service.saveFile(tenantId, file);

    expect(storageKey).toBeDefined();
    expect(storageKey).toContain(tenantId);
    expect(storageKey).toContain('test.pdf');

    const filePath = path.join(storagePath, storageKey);
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toBe('unit test data');
  });

  it('debe recuperar un archivo guardado', async () => {
    const tenantId = 't2';
    const file = {
      buffer: Buffer.from('read data'),
      originalname: 'read.txt',
    };

    const storageKey = await service.saveFile(tenantId, file);
    const data = await service.getFile(storageKey);
    expect(data.toString()).toBe('read data');
  });
});
