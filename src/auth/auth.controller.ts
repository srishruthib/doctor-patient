// src/auth/auth.controller.ts
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Res,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSignInDto, Role } from './dto/auth-signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';

import * as express from 'express';

@Controller('auth') // Base path for all routes in this controller will be /auth
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: AuthSignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() signinDto: AuthSignInDto) {
        return this.authService.signIn(signinDto); // This was already fixed to 'signIn'
    }

    @Post('signout')
    @UseGuards(JwtAuthGuard) // Requires a valid JWT access token
    @HttpCode(HttpStatus.OK)
    async signout(@Req() req: any) { // Use 'any' for req.user if not fully typed
        // ====> CHANGE THIS LINE <====
        return this.authService.logout(req.user.sub); // Changed from .signOut to .logout
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') token: string) {
        return this.authService.refreshTokens(token);
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const user = req.user as any;
        const authResult = await this.authService.handleGoogleAuth(user);
        const accessToken = authResult.accessToken;
        const refreshToken = authResult.refreshToken;
        const googleUser = authResult.user;

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken, user: { id: googleUser.id, email: googleUser.email, role: googleUser.role } };
    }
}
