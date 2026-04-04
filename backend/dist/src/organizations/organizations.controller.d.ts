import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly orgService;
    constructor(orgService: OrganizationsService);
    createOrg(body: any, user: any): Promise<{
        message: string;
        userId: any;
    }>;
    getOrg(id: string, user: any): Promise<{
        id: string;
        message: string;
        accessedBy: any;
    }>;
}
