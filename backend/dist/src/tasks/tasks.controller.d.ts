import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(orgId: string, createTaskDto: CreateTaskDto): Promise<{
        id: string;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        expedienteId: string;
        dueDate: Date | null;
    }>;
    findAll(orgId: string, expedienteId?: string): Promise<{
        id: string;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        expedienteId: string;
        dueDate: Date | null;
    }[]>;
    findOne(orgId: string, id: string): Promise<{
        id: string;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        expedienteId: string;
        dueDate: Date | null;
    }>;
    update(orgId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<{
        id: string;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        expedienteId: string;
        dueDate: Date | null;
    }>;
    remove(orgId: string, id: string): Promise<{
        id: string;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        expedienteId: string;
        dueDate: Date | null;
    }>;
}
