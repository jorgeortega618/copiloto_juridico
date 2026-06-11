import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ClientsModule } from './clients/clients.module';
import { ExpedientesModule } from './expedientes/expedientes.module';
import { TasksModule } from './tasks/tasks.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { ParserModule } from './parser/parser.module';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    PrismaModule, 
    AuthModule, 
    OrganizationsModule, 
    ClientsModule, 
    ExpedientesModule, 
    TasksModule, 
    StorageModule, 
    DocumentsModule, 
    ParserModule, AiModule, EventsModule, CalendarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// trigger
