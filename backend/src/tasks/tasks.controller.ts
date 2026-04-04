import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg } from '../common/decorators/auth.decorators';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@CurrentOrg() orgId: string, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(orgId, createTaskDto);
  }

  @Get()
  findAll(@CurrentOrg() orgId: string, @Query('expedienteId') expedienteId?: string) {
    return this.tasksService.findAll(orgId, expedienteId);
  }

  @Get(':id')
  findOne(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.tasksService.findOne(orgId, id);
  }

  @Patch(':id')
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(orgId, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.tasksService.remove(orgId, id);
  }
}
