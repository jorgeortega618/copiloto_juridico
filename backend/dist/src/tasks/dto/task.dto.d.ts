export declare class CreateTaskDto {
    expedienteId: string;
    title: string;
    description?: string;
    status?: string;
    dueDate?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
}
