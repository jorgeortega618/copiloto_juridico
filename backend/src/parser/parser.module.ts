import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { BullModule } from '@nestjs/bullmq';
import { StorageModule } from '../storage/storage.module';
import { ParserProcessor } from './parser.processor';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({
      name: 'document-parsing',
    }),
    StorageModule
  ],
  providers: [ParserService, ParserProcessor],
  exports: [BullModule] // export so documents module can use the queue
})
export class ParserModule {}
