// src/typeorm.config.ts
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Doctor } from './entities/Doctor';
import { Patient } from './entities/Patient';
import { RefreshToken } from './entities/RefreshToken';
import { DoctorAvailability } from './entities/DoctorAvailability';
import { DoctorTimeSlot } from './entities/DoctorTimeSlot';
import { Appointment } from './entities/Appointment';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'hospital_app_db',
    entities: [Doctor, Patient, RefreshToken, DoctorAvailability, DoctorTimeSlot, Appointment],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
    logging: true,
});
