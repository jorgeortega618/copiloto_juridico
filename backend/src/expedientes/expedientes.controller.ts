import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto, UpdateExpedienteDto } from './dto/expediente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg } from '../common/decorators/auth.decorators';

@Controller('expedientes')
@UseGuards(JwtAuthGuard)
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  create(@CurrentOrg() orgId: string, @Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedientesService.create(orgId, createExpedienteDto);
  }

  @Get()
  findAll(@CurrentOrg() orgId: string) {
    return this.expedientesService.findAll(orgId);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.expedientesService.findOne(orgId, id);
  }

  @Patch(':id')
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedientesService.update(orgId, id, updateExpedienteDto);
  }

  @Delete(':id')
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.expedientesService.remove(orgId, id);
  }
}
