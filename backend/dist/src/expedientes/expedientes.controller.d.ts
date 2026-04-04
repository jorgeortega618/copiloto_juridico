import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto, UpdateExpedienteDto } from './dto/expediente.dto';
export declare class ExpedientesController {
    private readonly expedientesService;
    constructor(expedientesService: ExpedientesService);
    create(orgId: string, createExpedienteDto: CreateExpedienteDto): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
    }>;
    findAll(orgId: string): Promise<({
        client: {
            id: string;
            name: string;
            createdAt: Date;
            email: string | null;
            orgId: string;
            phone: string | null;
            documentId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
    })[]>;
    findOne(orgId: string, id: string): Promise<{
        tasks: {
            id: string;
            orgId: string;
            title: string;
            description: string | null;
            status: string;
            expedienteId: string;
            dueDate: Date | null;
        }[];
        documents: {
            id: string;
            createdAt: Date;
            orgId: string;
            status: string;
            expedienteId: string;
            fileName: string;
            minioKey: string;
            uploadedById: string;
        }[];
        client: {
            id: string;
            name: string;
            createdAt: Date;
            email: string | null;
            orgId: string;
            phone: string | null;
            documentId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
    }>;
    update(orgId: string, id: string, updateExpedienteDto: UpdateExpedienteDto): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
    }>;
    remove(orgId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        title: string;
        description: string | null;
        status: string;
        clientId: string;
    }>;
}
