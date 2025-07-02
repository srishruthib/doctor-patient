// src/auth/auth.controller.ts
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async signout(@Req() req: any) {
        return this.authService.logout(req.user.sub);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') token: string) {
        return this.authService.refreshTokens(token);
    }

    // ✅ STEP 1: Initiate Google OAuth (this fixes your 404 error)
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // This route redirects to Google's consent screen
    }

    // ✅ STEP 2: Google OAuth callback handler
    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const userPayload = req.user as any;
        const authResult = await this.authService.handleGoogleAuth(userPayload);

        const { accessToken, refreshToken, user } = authResult;

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: this.configService.get<string>('NODE_ENV') === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax',
            });
        }

        return {
            accessToken,
            user,
        };
    }
}
