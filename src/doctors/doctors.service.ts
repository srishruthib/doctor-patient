
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(@InjectRepository(Doctor) private repo: Repository<Doctor>) {}

  search(name?: string, specialization?: string) {
    const where = {};
    if (name) where['name'] = ILike(`%${name}%`);
    if (specialization) where['specialization'] = ILike(`%${specialization}%`);
    return this.repo.find({ where });
  }

  getById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
