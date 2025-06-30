import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: any): Promise<string>;
    signin(body: any): Promise<string>;
    googleAuth(role: string, req: any): Promise<void>;
    googleCallback(req: any): Promise<string>;
}
