import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chatWithDocuments(orgId: string, user: any, query: string, expedienteId?: string): Promise<{
        answer: string | null;
        sources: {
            fileName: any;
            snippet: string;
            similarity: any;
        }[];
    }>;
}
