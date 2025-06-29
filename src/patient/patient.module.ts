// src/patient/patient.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from '../entities/Patient';
import { AuthModule } from '../auth/auth.module'; // ADDED: Import AuthModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient]),
        AuthModule, // ADDED: Import AuthModule to make JwtAuthGuard and JwtService available
    ],
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService], // Export PatientService if needed by other modules
})
export class PatientModule { }
