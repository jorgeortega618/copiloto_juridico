import { Module } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesController } from './expedientes.controller';

@Module({
  providers: [ExpedientesService],
  controllers: [ExpedientesController]
})
export class ExpedientesModule {}
