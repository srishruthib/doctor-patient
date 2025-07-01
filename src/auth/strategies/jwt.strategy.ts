// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Role } from '../dto/auth-signup.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        // FIX: Use JWT_ACCESS_SECRET from .env
        const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');

        if (!jwtSecret) {
            throw new InternalServerErrorException(
                'JWT Secret is not configured. Check JWT_ACCESS_SECRET in .env'
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any) {
        // payload.sub is the userId, payload.role is the role from the JWT token
        // We still validate the user exists in the database
        const user = await this.authService.validateUserByIdAndRole(payload.sub, payload.role as Role);

        if (!user) {
            throw new UnauthorizedException('User not found or invalid token');
        }

        // ====> CRITICAL FIX: Return an object with 'sub' and 'role' (and any other necessary payload data) <====
        // This ensures that req.user in your controllers will have req.user.sub and req.user.role
        // The 'sub' property is typically used by Passport to store the user's ID.
        return { sub: payload.sub, role: payload.role };
    }
}
