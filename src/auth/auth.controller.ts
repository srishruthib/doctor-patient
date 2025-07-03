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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto, AuthSignInDto } from './dto/auth-signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import * as express from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    // ✅ Signup
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: AuthSignupDto) {
        return this.authService.signup(signupDto);
    }

    // ✅ Signin
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() signinDto: AuthSignInDto) {
        return this.authService.signIn(signinDto);
    }

    // ✅ Signout
    @Post('signout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async signout(@Req() req: any) {
        return this.authService.logout(req.user.sub);
    }

    // ✅ Refresh Token
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') token: string) {
        return this.authService.refreshTokens(token);
    }

    // ✅ Initiate Google OAuth (🔥 This fixes the "Cannot GET" issue)
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: express.Request) {
        // This route triggers redirect to Google's OAuth consent screen
    }

    // ✅ Handle Google OAuth Callback
    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response
    ) {
        const userPayload = req.user as any;
        const authResult = await this.authService.handleGoogleAuth(userPayload);

        const accessToken = authResult.accessToken;
        const refreshToken = authResult.isNewUser ? null : authResult.refreshToken;

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: this.configService.get<string>('NODE_ENV') === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'lax',
            });
        }

        return {
            accessToken,
            user: {
                id: authResult.user.id,
                email: authResult.user.email,
                role: authResult.user.role,
            },
        };
    }
}
