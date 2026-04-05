import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { BullModule } from '@nestjs/bullmq';
import { AiProcessor } from './ai.processor';

import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'ai-processing',
    }),
    EventsModule
  ],
  providers: [AiService, AiProcessor],
  controllers: [AiController],
  exports: [AiService, BullModule]
})
export class AiModule {}
