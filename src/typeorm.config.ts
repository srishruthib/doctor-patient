// src/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { TimeSlot } from './entities/TimeSlot'; // Assuming this exists from previous work
import { Appointment } from './entities/Appointment'; // Assuming this exists from previous work
import { DoctorAvailability } from './entities/DoctorAvailability'; // NEW Import
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';     // NEW Import

const TypeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_DATABASE || 'hospital_db',
    entities: [
        Doctor,
        Patient,
        RefreshToken,
        TimeSlot,
        Appointment,
        DoctorAvailability, // Crucially, ensure this is present
        DoctorTimeSlot,     // Crucially, ensure this is present
    ],
    synchronize: process.env.NODE_ENV === 'development', // Keep true for development to auto-create tables
    logging: ['query', 'error'], // Log SQL queries and errors
};

export default TypeOrmConfig;
