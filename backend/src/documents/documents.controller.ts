import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg, CurrentUser } from '../common/decorators/auth.decorators';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':expedienteId')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: any,
    @Param('expedienteId') expedienteId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.documentsService.uploadDocument(orgId, expedienteId, user.userId, file, title);
  }

  @Get('expediente/:expedienteId')
  findAllByExpediente(@CurrentOrg() orgId: string, @Param('expedienteId') expedienteId: string) {
    return this.documentsService.findAllByExpediente(orgId, expedienteId);
  }

  @Get(':id/url')
  getDocumentUrl(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.documentsService.getDocumentUrl(orgId, id);
  }
}
