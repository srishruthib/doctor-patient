
import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(@Body() body) {
    return this.authService.signin(body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Query('role') role: string, @Req() req) {}

 @Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(@Req() req) {
  return this.authService.googleLogin(req.user); // Now returns a JSON token
}

}
