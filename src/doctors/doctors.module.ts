// src/doctors/doctors.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorService } from './doctors.service'; // Ensure this is correct
import { Doctor } from '../entities/Doctor'; // Corrected import path for Doctor entity
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorAvailability, DoctorTimeSlot]),
  ],
  controllers: [DoctorsController],
  providers: [DoctorService],
  exports: [DoctorService], // Export DoctorService if other modules need to use it
})
export class DoctorsModule { }
