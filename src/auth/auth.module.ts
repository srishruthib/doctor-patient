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
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // ADDED: Import JwtAuthGuard for export

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
        JwtAuthGuard, // JwtAuthGuard is a provider in this module
    ],
    exports: [
        AuthService,
        JwtAuthGuard, // ADDED: Export JwtAuthGuard so other modules can use it
        JwtModule // EXPORTED: JwtModule to ensure JwtService is available as a provider to other modules that import AuthModule
    ],
})
export class AuthModule { }
