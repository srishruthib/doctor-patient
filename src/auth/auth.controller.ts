// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, Res, UseGuards, Query, BadRequestException, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// REMOVED: import { Request, Response } from 'express'; // This causes issues
// Use the types provided by NestJS's Req and Res decorators which are typically Express types
// No explicit import of 'Request' or 'Response' from 'express' needed if using @Req() / @Res()

import { AuthService } from './auth.service';
import { AuthSignupDto } from './dto/auth-signup.dto';
import { AuthSigninDto } from './dto/auth-signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() dto: AuthSignupDto) {
        return this.authService.signup(dto);
    }

    @Post('signin')
    async signin(@Body() dto: AuthSigninDto) {
        return this.authService.signin(dto);
    }

    @Post('signout')
    @UseGuards(JwtAuthGuard)
    // NestJS's @Req() and @Res() should provide the correctly typed Express request/response objects
    async signout(@Req() req: any, @Res({ passthrough: true }) res: any) { // Using 'any' as a fallback if types still conflict
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new BadRequestException('No refresh token provided.');
        }
        await this.authService.signout(refreshToken);
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'lax' });
        return { message: 'Signed out successfully' };
    }

    @Post('refresh')
    // NestJS's @Req() and @Res() should provide the correctly typed Express request/response objects
    async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) { // Using 'any' as a fallback
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new BadRequestException('No refresh token provided.');
        }
        const tokens = await this.authService.refresh(refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return { accessToken: tokens.accessToken, role: tokens.role };
    }

    // Google OAuth login initiation route
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: any, @Query('role') role: 'doctor' | 'patient' = 'patient') { // Using 'any' as a fallback
        // The role parameter is passed to Google as a 'state' parameter to preserve it through the OAuth flow.
        // Passport-google-oauth20 will automatically handle this 'state' and pass it to the validate method.
        // We just need to ensure the query parameter is correctly handled for the guard.
    }

    // Google OAuth callback route
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @Redirect()
    // NestJS's @Req() and @Res() should provide the correctly typed Express request/response objects
    async googleAuthCallback(@Req() req: any, @Res({ passthrough: true }) res: any) { // Using 'any' as a fallback
        const user = req.user as Doctor | Patient | { message: string };

        if (!user) {
            throw new BadRequestException('Google OAuth failed. No user data received.');
        }

        if ('message' in user && user.message === 'Account is registered via email/password. Please login with your email and password.') {
            return { url: 'http://localhost:3000/error?message=' + encodeURIComponent(user.message) };
        }

        const userDetails = user as Doctor | Patient;
        const userId = userDetails.role === 'doctor' ? (userDetails as Doctor).doctor_id : (userDetails as Patient).patient_id;

        const tokens = await this.authService.generateTokens(
            userId,
            userDetails.email,
            userDetails.role
        );

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const redirectUrl = userDetails.role === 'doctor'
            ? `http://localhost:3000/doctor/profile?accessToken=${tokens.accessToken}`
            : `http://localhost:3000/patient/profile?accessToken=${tokens.accessToken}`;

        return { url: redirectUrl };
    }
}
