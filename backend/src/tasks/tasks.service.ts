import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateTaskDto) {
    // Ideally verify expediente belongs to org. For MVP assume valid if passed UI.
    return this.prisma.task.create({
      data: { ...dto, orgId },
    });
  }

  async findAll(orgId: string, expedienteId?: string) {
    return this.prisma.task.findMany({
      where: { orgId, ...(expedienteId && { expedienteId }) }
    });
  }

  async findOne(orgId: string, id: string) {
    const tsk = await this.prisma.task.findFirst({
      where: { id, orgId }
    });
    if (!tsk) throw new NotFoundException('Task not found');
    return tsk;
  }

  async update(orgId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(orgId, id);
    return this.prisma.task.update({
      where: { id },
      data: dto as any, // dates might need mapping
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
