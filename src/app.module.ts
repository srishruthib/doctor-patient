// src/app.module.ts
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Your existing modules
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

// Your existing entities (ensure all are listed)
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability';
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';
import { Appointment } from './entities/Appointment';

@Module({
  imports: [
    // Your ConfigModule setup (global and envFilePath)
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available everywhere
      envFilePath: '.env', // Path to your .env file
    }),
    // Your TypeOrmModule.forRootAsync setup
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import Nest's ConfigModule here
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // List all your entities here from your project
        entities: [Doctor, Patient, RefreshToken, DoctorAvailability, DoctorTimeSlot, Appointment],
        // Set synchronize based on NODE_ENV for safety in production
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: true, // Keep logging for debugging
      }),
    }),
    // Your application's feature modules
    AuthModule,
    DoctorModule,
    PatientModule,
    // Removed conflicting UsersModule and DoctorsModule from the other side of the merge
  ],
  controllers: [], // Keep empty if no root controllers
  providers: [],   // Keep empty if no root providers
})
export class AppModule { }
