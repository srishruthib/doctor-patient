// src/doctors/doctors.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm'; // <--- ADD Like for search functionality
import { Doctor } from '../entities/Doctor';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateScheduleTypeDto } from './dto/update-schedule-type.dto';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot'; // <--- NEW IMPORT for getAvailability
import { DoctorAvailability } from '../entities/DoctorAvailability'; // <--- NEW IMPORT for getAvailability
import * as moment from 'moment'; // <--- NEW IMPORT for date handling in getAvailability

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(DoctorTimeSlot) // <--- Inject DoctorTimeSlotRepository
    private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
    @InjectRepository(DoctorAvailability) // <--- Inject DoctorAvailabilityRepository
    private doctorAvailabilityRepository: Repository<DoctorAvailability>,
  ) { }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Implement doctor creation logic here
    // Remember to hash password before saving
    const newDoctor = this.doctorsRepository.create(createDoctorDto);
    return this.doctorsRepository.save(newDoctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorsRepository.find();
  }

  // Existing findOne method, renamed to match controller's getDoctorById
  async getDoctorById(id: number): Promise<Doctor> { // <--- RENAMED/IMPLEMENTED getDoctorById
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
    return doctor;
  }

  // New search method
  async search(name?: string, specialization?: string): Promise<Doctor[]> { // <--- NEW METHOD
    const query: any = {};
    if (name) {
      query.first_name = Like(`%${name}%`); // Assuming search by first_name
    }
    if (specialization) {
      query.specialization = Like(`%${specialization}%`);
    }
    return this.doctorsRepository.find({ where: query });
  }

  async update(id: number, updateDoctorDto: UpdateScheduleTypeDto): Promise<Doctor> {
    const doctor = await this.getDoctorById(id); // Use the new getDoctorById
    Object.assign(doctor, updateDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async updateScheduleType(id: number, scheduleType: 'stream' | 'wave'): Promise<Doctor> {
    const doctor = await this.getDoctorById(id); // Use the new getDoctorById
    doctor.schedule_Type = scheduleType;
    return this.doctorsRepository.save(doctor);
  }

  // New getAvailability method (moved from AvailabilityService if it was there, or re-implemented)
  async getAvailability(
    doctorId: number,
    date?: string,
    startTime?: string,
  ): Promise<DoctorTimeSlot[]> { // <--- NEW METHOD
    const doctor = await this.getDoctorById(doctorId); // Check if doctor exists

    const queryBuilder = this.doctorTimeSlotRepository.createQueryBuilder('slot')
      .leftJoinAndSelect('slot.doctor_availability', 'availability')
      .where('slot.doctor_id = :doctorId', { doctorId })
      .andWhere('slot.is_available = :isAvailable', { isAvailable: true });

    if (date) {
      const parsedDate = moment(date, 'YYYY-MM-DD');
      if (!parsedDate.isValid()) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
      }
      queryBuilder.andWhere('availability.date = :date', { date: date }); // Filter by date in availability
    }

    if (startTime) {
      const parsedStartTime = moment(startTime, 'HH:mm');
      if (!parsedStartTime.isValid()) {
        throw new BadRequestException('Invalid start_time format. Use HH:mm.');
      }
      queryBuilder.andWhere('slot.slot_time >= :startTime', { startTime });
    }

    queryBuilder.orderBy('availability.date', 'ASC');
    queryBuilder.addOrderBy('slot.slot_time', 'ASC');

    return queryBuilder.getMany();
  }

  async remove(id: number): Promise<void> {
    const result = await this.doctorsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
  }
}
