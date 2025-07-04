// src/availability/availability.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { DoctorAvailability } from '../entities/DoctorAvailability'; // Adjust path if needed
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot'; // Adjust path if needed
import { Doctor } from '../entities/Doctor'; // Needed to link availability to doctor
import { AuthModule } from '../auth/auth.module'; // To use JwtAuthGuard

@Module({
    imports: [
        TypeOrmModule.forFeature([DoctorAvailability, DoctorTimeSlot, Doctor]), // Include entities used by this module
        AuthModule, // Import AuthModule to use JwtAuthGuard and other auth features
    ],
    controllers: [AvailabilityController],
    providers: [AvailabilityService],
    exports: [AvailabilityService], // Export if other modules need to inject AvailabilityService
})
export class AvailabilityModule { }
