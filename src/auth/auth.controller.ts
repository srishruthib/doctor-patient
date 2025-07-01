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
    Param, // Not used in this version, but kept if needed later
    Query, // Not used in this version, but kept if needed later
    ForbiddenException, // Not explicitly used in this version, but kept if needed later
    BadRequestException, // Not explicitly used in this version, but kept if needed later
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSignInDto, Role } from './dto/auth-signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard'; // Ensure this is correctly imported
import { Roles } from './decorators/roles.decorator'; // Ensure this is correctly imported
import { Doctor } from '../entities/Doctor'; // Kept for potential future use or if needed by other parts
import { Patient } from '../entities/Patient'; // Kept for potential future use or if needed by other parts

import * as express from 'express'; // Required for express.Request and express.Response types

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
        return this.authService.signIn(signinDto);
    }

    @Post('signout')
    @UseGuards(JwtAuthGuard) // Requires a valid JWT access token
    @HttpCode(HttpStatus.OK)
    async signout(@Req() req: any) { // Use 'any' for req.user if not fully typed
        return this.authService.logout(req.user.sub); // Corrected to .logout based on service
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') token: string) {
        return this.authService.refreshTokens(token);
    }

    // This is the correct Google OAuth redirect endpoint for handling the callback
    @Get('google/redirect')
    @UseGuards(AuthGuard('google')) // Use AuthGuard with 'google' strategy
    async googleAuthRedirect(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response // Use passthrough: true to let Nest handle response
    ) {
        // req.user will be populated by the GoogleStrategy after successful authentication
        const userPayload = req.user as any; // Cast to any to access properties easily (this is the raw Google profile)
        const authResult = await this.authService.handleGoogleAuth(userPayload); // Your service method

        const accessToken = authResult.accessToken;
        // Only provide refresh token if not a new user, or if handleGoogleAuth always returns it
        const refreshToken = authResult.isNewUser ? null : authResult.refreshToken;

        // Set refresh token as an HTTP-only cookie
        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: this.configService.get<string>('NODE_ENV') === 'production', // Use secure in production
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax', // Corrected to lowercase 'lax'
            });
        }

        // Return access token and user info in the response body
        return {
            accessToken,
            user: {
                id: authResult.user.id, // Access user properties from authResult.user
                email: authResult.user.email,
                role: authResult.user.role
            }
        };
    }

    // If you need a separate endpoint to initiate Google OAuth, it would look something like this:
    // @Get('google')
    // @UseGuards(AuthGuard('google'))
    // async googleAuth(@Req() req) {
    //     // Initiates the Google OAuth flow
    //     // Passport will redirect to Google's consent screen
    // }
}
