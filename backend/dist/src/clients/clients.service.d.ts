import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(orgId: string, dto: CreateClientDto): Promise<{
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
    update(orgId: string, id: string, dto: UpdateClientDto): Promise<{
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
