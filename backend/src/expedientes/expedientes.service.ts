import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpedienteDto, UpdateExpedienteDto } from './dto/expediente.dto';

@Injectable()
export class ExpedientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateExpedienteDto) {
    return this.prisma.expediente.create({
      data: { ...dto, orgId },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.expediente.findMany({
      where: { orgId },
      include: { client: true }
    });
  }

  async findOne(orgId: string, id: string) {
    const exp = await this.prisma.expediente.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        tasks: {
          include: { assignee: true }
        },
        documents: true,
        events: true,
        users: {
          include: { user: true }
        }
      }
    });
    if (!exp) throw new NotFoundException('Expediente not found');
    return exp;
  }

  async update(orgId: string, id: string, dto: UpdateExpedienteDto) {
    await this.findOne(orgId, id);
    return this.prisma.expediente.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.expediente.delete({
      where: { id },
    });
  }
}
