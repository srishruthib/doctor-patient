// src/auth/strategies/google.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables if not already handled globally

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://doctor-patient-yf51.onrender.com/api/v1/auth/google/redirect',
      scope: ['email', 'profile'],
      passReqToCallback: true, // Allows access to req.query.role
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const role = req.query.role === 'doctor' ? 'doctor' : 'patient'; // fallback to 'patient'

    const user = {
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      password: null, // no password for Google
      role,
    };

    return done(null, user); // Passport attaches this to req.user
  }
}
