
// IMPORTANT: 'reflect-metadata' MUST be imported first for TypeORM and NestJS decorators to work correctly.
import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Your application's feature modules
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientModule } from './patient/patient.module';

// Your entities
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability';
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';
import { Appointment } from './entities/Appointment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Doctor,
          Patient,
          RefreshToken,
          DoctorAvailability,
          DoctorTimeSlot,
          Appointment,
        ],
        synchronize: true, // Disable this in production!
        logging: true,
      }),
    }),
    AuthModule,
    DoctorsModule,
    PatientModule,
  ],
})
export class AppModule { }
