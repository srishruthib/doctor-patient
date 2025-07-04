import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

import { AuthModule } from '../auth/auth.module'; // ✅ Import this

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor]),
    AuthModule, // ✅ This provides AuthService, JwtService, JwtStrategy
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
})
export class DoctorsModule { }
