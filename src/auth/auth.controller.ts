
import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

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
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.googleLogin(req.user);
    res.redirect(`http://localhost:3000/login/success?token=${jwt}`);
  }
}
