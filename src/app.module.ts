// src/app.module.ts
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Your existing modules
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientModule } from './patient/patient.module';
import { AvailabilityModule } from './availability/availability.module'; // <--- THIS LINE IS CRITICAL AND MUST BE ADDED

// Your existing entities (ensure all are listed)
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
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10), // Ensure port is parsed as number
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Doctor, Patient, RefreshToken, DoctorAvailability, DoctorTimeSlot, Appointment], // List all your entities here
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Set to false in production
        logging: true, // Enable logging for debugging SQL queries
      }),
    }),
    AuthModule,
    DoctorsModule,
    PatientModule,
    AvailabilityModule, // <--- THIS LINE IS CRITICAL AND MUST BE ADDED
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
