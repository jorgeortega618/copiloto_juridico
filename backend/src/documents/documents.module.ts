import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageModule } from '../storage/storage.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    StorageModule,
    BullModule.registerQueue({ name: 'document-parsing' })
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
