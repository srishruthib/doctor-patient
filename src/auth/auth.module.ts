// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { RefreshToken } from '../entities/RefreshToken';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([Doctor, Patient, RefreshToken]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRY') || '1h' },
            }),
        }),
        ConfigModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        GoogleStrategy,
        JwtAuthGuard,
    ],
    // CRITICAL FIX: Export JwtModule so other modules can use JwtService
    exports: [
        AuthService,
        JwtAuthGuard,
        JwtModule // <--- ADDED THIS LINE
    ],
})
export class AuthModule { }
