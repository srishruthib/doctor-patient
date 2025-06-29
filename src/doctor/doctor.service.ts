// src/doctor/doctor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/Doctor';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
    ) { }

    async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const doctor = this.doctorRepository.create(createDoctorDto);
        return this.doctorRepository.save(doctor);
    }

    async findAll(): Promise<Doctor[]> {
        return this.doctorRepository.find();
    }

    async findOne(id: number): Promise<Doctor> {
        // FIX: Use 'id' instead of 'doctor_id'
        const doctor = await this.doctorRepository.findOne({ where: { id } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }
        return doctor;
    }

    async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        // FIX: Use 'id' instead of 'doctor_id'
        const doctor = await this.doctorRepository.findOne({ where: { id } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        // Merge existing doctor with updated data
        Object.assign(doctor, updateDoctorDto);

        return this.doctorRepository.save(doctor);
    }

    async remove(id: number): Promise<void> {
        // FIX: Use 'id' as the argument for delete operation
        const result = await this.doctorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }
    }
}
