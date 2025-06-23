
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async signup(data) {
    const userExists = await this.usersService.findByEmail(data.email);
    if (userExists) throw new BadRequestException('User already exists');
    if (!data.password || !data.role) throw new BadRequestException('Missing data');
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hashed,
      provider: 'local',
    });
    return this.generateToken(user);
  }

  async signin(data) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.provider === 'google')
      throw new BadRequestException('Account registered with Google. Login with Google.');
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return this.generateToken(user);
  }

  async googleLogin(profile) {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        provider: 'google',
        password: null,
        role: profile.role || 'patient',
      });
    }
    return this.generateToken(user);
  }

  generateToken(user) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
