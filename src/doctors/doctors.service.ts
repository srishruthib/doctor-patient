// src/doctors/doctors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { DoctorAvailability } from '../entities/DoctorAvailability';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>, // ✅ Injected
  ) { }

  async search(name?: string, specialization?: string) {
    const where: any = {};
    if (name) where.name = ILike(`%${name}%`);
    if (specialization) where.specialization = ILike(`%${specialization}%`);
    return this.doctorRepo.find({ where });
  }

  async getById(id: string) {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async create(dto: CreateDoctorDto) {
    const doctor = this.doctorRepo.create(dto);
    return this.doctorRepo.save(doctor);
  }

  async getAvailability(doctorId: string, date?: string, start_time?: string) {
    const where: any = { doctor_id: doctorId };
    if (date) where.date = date;
    if (start_time) where.start_time = start_time;

    return this.availabilityRepo.find({ where });
  }
}
