import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        orgId,
        title: dto.title,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        expedienteId: dto.expedienteId || null,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { orgId },
      include: { expediente: { select: { id: true, title: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, orgId },
      include: { expediente: { select: { id: true, title: true } } },
    });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async update(orgId: string, id: string, dto: UpdateCalendarEventDto) {
    await this.findOne(orgId, id);
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (dto.expedienteId !== undefined) data.expedienteId = dto.expedienteId || null;

    return this.prisma.calendarEvent.update({
      where: { id },
      data,
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
