// src/patient/patient.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/Patient';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    async getPatientProfile(patientId: number): Promise<Omit<Patient, 'password'>> {
        const patient = await this.patientRepository.findOne({ where: { patient_id: patientId } });
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }
        const { password, ...result } = patient;
        return result;
    }
}
