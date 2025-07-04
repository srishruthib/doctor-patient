// src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Import InternalServerErrorException
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Role } from '../dto/auth-signup.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

        // CRITICAL FIX: Ensure required config values are present
        if (!clientID || !clientSecret || !callbackURL) {
            throw new InternalServerErrorException(
                'Google OAuth configuration is incomplete. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL in .env'
            );
        }

        super({
            clientID: clientID, // Now guaranteed to be string
            clientSecret: clientSecret, // Now guaranteed to be string
            callbackURL: callbackURL, // Now guaranteed to be string
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, id } = profile;
        const email = emails[0].value;
        const googleId = id;
        const firstName = name.givenName;
        const lastName = name.familyName;

        try {
            const assumedRole: Role = emails[0].value.includes('@doctor.com') ? Role.Doctor : Role.Patient;

            const result = await this.authService.handleGoogleAuth({
                email,
                firstName,
                lastName,
                googleId,
                role: assumedRole,
            });

            done(null, result.user);
        } catch (error) {
            done(new UnauthorizedException('Google authentication failed'), false);
        }
    }
}
