import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: { ...dto, orgId },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.client.findMany({
      where: { orgId }
    });
  }

  async findOne(orgId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, orgId }
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(orgId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(orgId, id); // ensure it exists in this org
    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
