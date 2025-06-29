// src/patient/patient.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/Patient';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
    ) { }

    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = this.patientRepository.create(createPatientDto);
        return this.patientRepository.save(patient);
    }

    async findAll(): Promise<Patient[]> {
        return this.patientRepository.find();
    }

    async findOne(id: number): Promise<Patient> {
        // FIX: Use 'id' instead of 'patient_id'
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        // FIX: Use 'id' instead of 'patient_id'
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }

        // Merge existing patient with updated data
        Object.assign(patient, updatePatientDto);

        return this.patientRepository.save(patient);
    }

    async remove(id: number): Promise<void> {
        // FIX: Use 'id' as the argument for delete operation
        const result = await this.patientRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
    }
}
