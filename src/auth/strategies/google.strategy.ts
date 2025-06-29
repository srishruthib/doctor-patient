// src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service'; // Import AuthService
import { Doctor } from '../../entities/Doctor'; // Import Doctor entity
import { Patient } from '../../entities/Patient'; // Import Patient entity

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService, // Inject AuthService
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'], // Request email and profile info
            passReqToCallback: true, // Allows us to access req object for role parameter
        });
    }

    // This method is called after Google authenticates the user and redirects back to our callbackURL
    async validate(
        request: any, // The incoming request, used to get the 'role' query parameter
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            const { name, emails, id: googleId } = profile;
            const email = emails[0].value;
            const firstName = name.givenName;
            const lastName = name.familyName;
            const role: 'doctor' | 'patient' = request.query.state as 'doctor' | 'patient' || 'patient';

            console.log('GoogleStrategy: Validating user...');
            console.log('Profile:', profile);
            console.log('Email:', email, 'FirstName:', firstName, 'LastName:', lastName, 'Role:', role);

            if (!email) {
                console.error('GoogleStrategy Error: Google profile missing email.');
                throw new InternalServerErrorException('Google profile missing email.');
            }

            let user: Doctor | Patient | null = null;
            if (role === 'doctor') {
                user = await this.authService.findDoctorByEmailOrGoogleId(email, googleId);
                console.log('GoogleStrategy: Found Doctor?', user);
            } else {
                user = await this.authService.findPatientByEmailOrGoogleId(email, googleId);
                console.log('GoogleStrategy: Found Patient?', user);
            }

            if (user) {
                console.log('GoogleStrategy: User found:', user);
                if (user.provider === 'local') {
                    console.log('GoogleStrategy: Local account exists. Checking for GoogleId update.');
                    if (!user.googleId) {
                        if (user.role === 'doctor') {
                            await this.authService.updateDoctorGoogleId((user as Doctor).doctor_id, googleId);
                            console.log('GoogleStrategy: Doctor GoogleId updated.');
                        } else if (user.role === 'patient') {
                            await this.authService.updatePatientGoogleId((user as Patient).patient_id, googleId);
                            console.log('GoogleStrategy: Patient GoogleId updated.');
                        }
                    }
                    console.log('GoogleStrategy: Redirecting for local account message.');
                    return done(null, { message: 'Account is registered via email/password. Please login with your email and password.' });
                }
                console.log('GoogleStrategy: Existing Google user. Logging in.');
                return done(null, user);
            } else {
                console.log('GoogleStrategy: User not found. Creating new user via Google.');
                let newUser: Doctor | Patient;
                if (role === 'doctor') {
                    newUser = await this.authService.createDoctorWithGoogle(
                        email,
                        firstName,
                        lastName,
                        googleId,
                        role
                    );
                    console.log('GoogleStrategy: New Doctor created:', newUser);
                } else {
                    newUser = await this.authService.createPatientWithGoogle(
                        email,
                        firstName,
                        lastName,
                        googleId,
                        role
                    );
                    console.log('GoogleStrategy: New Patient created:', newUser);
                }
                return done(null, newUser);
            }
        } catch (error: any) { // Explicitly type error as 'any' for full access
            console.error('Google OAuth Validation Error in GoogleStrategy:', error.message);
            console.error('Google OAuth Validation Error Stack:', error.stack);
            done(new InternalServerErrorException(`Google OAuth failed: ${error.message}`), false); // Pass a more specific error
        }
    }
}
