// src/app.module.ts
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability';
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';
import { Appointment } from './entities/Appointment'; // Ensure Appointment entity is imported

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available everywhere
      envFilePath: '.env', // Path to your .env file
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        // FIX: Use DB_NAME from .env
        database: configService.get<string>('DB_NAME'),
        entities: [Doctor, Patient, RefreshToken, DoctorAvailability, DoctorTimeSlot, Appointment], // List all your entities here
        // synchronize: true, // Set to false in production
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // <--- CHANGE BACK TO THIS
        logging: true, // Enable logging for debugging SQL queries
      }),
    }),
    AuthModule,
    DoctorModule,
    PatientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
