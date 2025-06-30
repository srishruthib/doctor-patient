
import { Controller, Post, Body, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
<<<<<<< HEAD
import { GoogleAuthGuard } from './guards/google-auth.guard';
=======
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors

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

<<<<<<< HEAD
 @Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(@Req() req) {
  return this.authService.googleLogin(req.user); // Now returns a JSON token
}

=======
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.googleLogin(req.user);
    res.redirect(`http://localhost:3000/login/success?token=${jwt}`);
  }
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
}
