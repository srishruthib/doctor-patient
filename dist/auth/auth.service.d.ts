import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    signup(data: any): Promise<string>;
    signin(data: any): Promise<string>;
    googleLogin(profile: any): Promise<string>;
    generateToken(user: any): string;
}
