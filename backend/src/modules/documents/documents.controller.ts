import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('Missing header x-tenant-id');
    }
    return this.documentsService.list(tenantId.trim(), { kind, patientId });
  }
}
