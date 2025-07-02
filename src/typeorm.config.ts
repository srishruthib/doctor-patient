// src/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv'; // ADDED: Import dotenv
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability';
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';
import { Appointment } from './entities/Appointment';

dotenv.config(); // ADDED: Call dotenv.config() to load env variables

const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'hospital_app_db',
    entities: [Doctor, Patient, RefreshToken, DoctorAvailability, DoctorTimeSlot, Appointment],
    synchronize: process.env.NODE_ENV === 'development', // Keep true for development to auto-create tables
    logging: true,
    migrations: ['dist/migrations/*.js'],
};

export default config;
