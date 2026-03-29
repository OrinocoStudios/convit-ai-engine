import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly baseDir: string;

  constructor(private readonly configService: ConfigService) {
    this.baseDir = this.configService.get<string>(
      'STORAGE_BASE_PATH',
      'storage',
    );
  }

  async saveFile(
    tenantId: string,
    file: { buffer: Buffer; originalname: string },
  ): Promise<string> {
    const tenantDir = path.join(this.baseDir, tenantId);

    try {
      await fs.mkdir(tenantDir, { recursive: true });
    } catch {
      throw new InternalServerErrorException(
        `Could not create storage directory for tenant ${tenantId}`,
      );
    }

    const timestamp = Date.now();
    const safeFilename = file.originalname
      .replace(/[^a-z0-9.]/gi, '_')
      .toLowerCase();
    const storageKey = `${timestamp}-${safeFilename}`;
    const filePath = path.join(tenantDir, storageKey);

    try {
      await fs.writeFile(filePath, file.buffer);
      return path.join(tenantId, storageKey); // Return relative path for storageKey
    } catch {
      throw new InternalServerErrorException(
        `Could not save file ${file.originalname}`,
      );
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    const filePath = path.join(this.baseDir, storageKey);
    try {
      await fs.rm(filePath, { force: true });
    } catch {
      throw new InternalServerErrorException(
        `Could not delete file ${storageKey}`,
      );
    }
  }

  async getFile(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, storageKey);
    try {
      return await fs.readFile(filePath);
    } catch {
      throw new InternalServerErrorException(
        `Could not read file ${storageKey}`,
      );
    }
  }
}
