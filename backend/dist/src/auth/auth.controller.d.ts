import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto, res: Response): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            organizations: any;
        };
    }>;
    login(body: LoginDto, res: Response): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            organizations: any;
        };
    }>;
    logout(res: Response): {
        message: string;
    };
}
