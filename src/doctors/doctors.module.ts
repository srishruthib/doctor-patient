// src/doctors/doctors.module.ts
import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- IMPORTANT: This import is needed
import { Doctor } from '../entities/Doctor'; // <--- IMPORTANT: Entity for DoctorsService
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot'; // <--- IMPORTANT: Entity for DoctorsService
import { DoctorAvailability } from '../entities/DoctorAvailability'; // <--- IMPORTANT: Entity for DoctorsService
import { AuthModule } from '../auth/auth.module'; // IMPORTANT: Needed because DoctorsController uses JwtAuthGuard and RolesGuard

@Module({
  imports: [
    // Register the TypeORM repositories for the entities used by DoctorsService
    TypeOrmModule.forFeature([Doctor, DoctorTimeSlot, DoctorAvailability]), // <--- CRITICAL: Register these repositories
    // Import AuthModule because DoctorsController uses authentication and authorization guards
    AuthModule,
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  // Export DoctorsService if other modules (like AppointmentsModule) need to inject it
  exports: [DoctorsService],
})
export class DoctorsModule { }
