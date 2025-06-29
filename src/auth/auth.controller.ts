// src/auth/auth.controller.ts (Snippet - only line 130 and surrounding context)
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

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    // ... (previous methods) ...

    /**
     * @route GET /auth/google/redirect
     * @description Handles the callback from Google OAuth.
     * @access Public
     */
    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const user = req.user as any; // User object from GoogleStrategy
        // FIX: Get the full result object and access properties individually
        const authResult = await this.authService.handleGoogleAuth(user);
        const accessToken = authResult.accessToken;
        const refreshToken = authResult.refreshToken;
        const googleUser = authResult.user; // Access the user object directly from authResult

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return tokens and the relevant user info (from googleUser)
        return { accessToken, user: { id: googleUser.id, email: googleUser.email, role: googleUser.role } };
    }
}
