import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg } from '../common/decorators/auth.decorators';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@CurrentOrg() orgId: string, @Body() dto: CreateCalendarEventDto) {
    return this.calendarService.create(orgId, dto);
  }

  @Get()
  findAll(@CurrentOrg() orgId: string) {
    return this.calendarService.findAll(orgId);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.calendarService.findOne(orgId, id);
  }

  @Patch(':id')
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateCalendarEventDto) {
    return this.calendarService.update(orgId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.calendarService.remove(orgId, id);
  }
}
