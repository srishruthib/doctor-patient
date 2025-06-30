import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

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
}
