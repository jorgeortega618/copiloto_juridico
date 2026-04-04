import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private readonly prisma;
    private openai;
    private readonly logger;
    constructor(prisma: PrismaService);
    queryExpediente(orgId: string, userId: string, query: string, expedienteId?: string): Promise<{
        answer: string | null;
        sources: {
            fileName: any;
            snippet: string;
            similarity: any;
        }[];
    }>;
}
