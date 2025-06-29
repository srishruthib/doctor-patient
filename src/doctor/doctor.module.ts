// src/doctor/doctor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor } from '../entities/Doctor';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
import { AuthModule } from '../auth/auth.module'; // NEW: Import AuthModule

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Doctor,
            DoctorAvailability,
            DoctorTimeSlot,
        ]),
        AuthModule, // NEW: Add AuthModule to imports to resolve JwtService dependency for guards
    ],
    providers: [DoctorService],
    controllers: [DoctorController],
    exports: [DoctorService],
})
export class DoctorModule { }
