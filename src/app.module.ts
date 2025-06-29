import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { Appointment } from './entities/Appointment';
import { TimeSlot } from './entities/TimeSlot';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability'; // ✅ Add this
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';         // ✅ Add this

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        logging: ['query', 'error'],
        entities: [
          Doctor,
          Patient,
          Appointment,
          TimeSlot,
          RefreshToken,
          DoctorAvailability, // ✅ now registered
          DoctorTimeSlot      // ✅ now registered
        ],
        migrations: [__dirname + '/migrations/*.js'],
        subscribers: [],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DoctorModule,
    PatientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
