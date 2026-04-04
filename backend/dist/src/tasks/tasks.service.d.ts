import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(orgId: string, dto: CreateTaskDto): Promise<{
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
    update(orgId: string, id: string, dto: UpdateTaskDto): Promise<{
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
