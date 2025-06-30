
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(req, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const role = req.query.role || 'patient';
    const user = {
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      role,
    };
    done(null, user);
  }
}
