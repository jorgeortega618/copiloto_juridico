import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg } from '../common/decorators/auth.decorators';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@CurrentOrg() orgId: string, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(orgId, createClientDto);
  }

  @Get()
  findAll(@CurrentOrg() orgId: string) {
    return this.clientsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.clientsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(orgId, id, updateClientDto);
  }

  @Delete(':id')
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.clientsService.remove(orgId, id);
  }
}
