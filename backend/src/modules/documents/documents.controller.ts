import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateClinicalDocumentDto } from './dto/create-clinical-document.dto';

/** Forma del archivo que entrega `FileInterceptor` (alineado con `DocumentsService.create`). */
type UploadedFilePayload = {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
};

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Body() dto: CreateClinicalDocumentDto,
    @UploadedFile() file?: UploadedFilePayload,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    if (!doctorUserId?.trim()) {
      throw new BadRequestException('Missing header x-doctor-user-id');
    }
    const upload = file
      ? {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype ?? 'application/octet-stream',
        }
      : undefined;

    return this.documentsService.create(
      tenantId.trim(),
      doctorUserId.trim(),
      dto,
      upload,
    );
  }

  @Get()
  list(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('kind') kind?: string,
    @Query('patientId') patientId?: string,
    @Query('category') category?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.documentsService.list(tenantId.trim(), {
      kind,
      patientId,
      category,
    });
  }

  @Get(':id/file')
  async download(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }

    const filePayload = await this.documentsService.getFileDownload(
      tenantId.trim(),
      id,
      doctorUserId?.trim(),
    );

    response.setHeader(
      'Content-Type',
      filePayload.mimeType ?? 'application/octet-stream',
    );
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${filePayload.filename}"`,
    );

    return new StreamableFile(filePayload.buffer);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-doctor-user-id') doctorUserId: string | undefined,
    @Param('id') id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.documentsService.findOne(
      tenantId.trim(),
      id,
      doctorUserId?.trim(),
    );
  }
}
