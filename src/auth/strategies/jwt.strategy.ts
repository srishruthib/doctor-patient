// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Import InternalServerErrorException
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
        const jwtSecret = configService.get<string>('JWT_SECRET');

        // CRITICAL FIX: Ensure JWT_SECRET is present
        if (!jwtSecret) {
            throw new InternalServerErrorException(
                'JWT Secret is not configured. Check JWT_SECRET in .env'
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret, // Now guaranteed to be string
        });
    }

    async validate(payload: any) {
        const user = await this.authService.validateUserByIdAndRole(payload.sub, payload.role as Role);

        if (!user) {
            throw new UnauthorizedException('User not found or invalid token');
        }
        return user;
    }
}
