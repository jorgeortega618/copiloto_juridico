import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(orgId: string, createClientDto: CreateClientDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        orgId: string;
        phone: string | null;
        documentId: string | null;
    }>;
    findAll(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        orgId: string;
        phone: string | null;
        documentId: string | null;
    }[]>;
    findOne(orgId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        orgId: string;
        phone: string | null;
        documentId: string | null;
    }>;
    update(orgId: string, id: string, updateClientDto: UpdateClientDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        orgId: string;
        phone: string | null;
        documentId: string | null;
    }>;
    remove(orgId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string | null;
        orgId: string;
        phone: string | null;
        documentId: string | null;
    }>;
}
