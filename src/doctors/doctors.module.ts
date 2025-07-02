// src/doctors/doctors.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorService } from './doctors.service';
import { Doctor } from '../entities/Doctor';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
import { AuthModule } from '../auth/auth.module'; // <--- ADDED THIS IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorAvailability, DoctorTimeSlot]),
    AuthModule, // <--- ADDED THIS LINE
  ],
  controllers: [DoctorsController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorsModule { }
