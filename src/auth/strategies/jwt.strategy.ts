// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service'; // NO .js
import { Doctor } from '../../entities/Doctor'; // NO .js
import { Patient } from '../../entities/Patient'; // NO .js

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string,
        });
    }

    async validate(payload: JwtPayload): Promise<Doctor | Patient> {
        const user = await this.authService.validateUserByIdAndRole(payload.sub, payload.role);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
