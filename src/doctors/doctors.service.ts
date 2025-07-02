// src/doctors/doctors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Doctor } from '../entities/Doctor'; // Corrected import path for Doctor entity
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto'; // <--- ADDED THIS IMPORT

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(DoctorAvailability)
    private doctorAvailabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(DoctorTimeSlot)
    private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
  ) { }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorsRepository.create(createDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async findAllDoctors(name?: string, specialization?: string): Promise<Doctor[]> {
    const query: any = {};
    if (name) {
      query.first_name = Like(`%${name}%`);
    }
    if (specialization) {
      query.specialization = Like(`%${specialization}%`);
    }
    return this.doctorsRepository.find({ where: query });
  }

  async findDoctorById(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
    return doctor;
  }

  async getDoctorProfile(id: number): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findDoctorById(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: number): Promise<void> {
    const result = await this.doctorsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Doctor with ID ${id} not found.`);
    }
  }

  async setDoctorAvailability(
    doctorId: number,
    createAvailabilityDto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const doctor = await this.findDoctorById(doctorId); // Fetch the doctor entity

    const { date, startTime, endTime, breakTimeStart, breakTimeEnd } = createAvailabilityDto;

    let availability = await this.doctorAvailabilityRepository.findOne({
      where: { doctor: { id: doctorId }, date },
    });

    if (!availability) {
      // Create new availability, linking to doctor via doctorId
      availability = this.doctorAvailabilityRepository.create({
        doctorId: doctor.id, // Use the doctor's ID for the foreign key
        date,
        startTime,
        endTime,
        breakTimeStart,
        breakTimeEnd,
      });
      // Assign the full doctor object for the relationship if needed later
      availability.doctor = doctor;
    } else {
      // Update existing availability
      Object.assign(availability, { startTime, endTime, breakTimeStart, breakTimeEnd });
    }

    await this.doctorAvailabilityRepository.save(availability);

    await this.generateTimeSlots(availability);

    return availability;
  }

  private async generateTimeSlots(availability: DoctorAvailability): Promise<void> {
    await this.doctorTimeSlotRepository.delete({ availability: { id: availability.id } });

    const start = new Date(`${availability.date}T${availability.startTime}:00`);
    const end = new Date(`${availability.date}T${availability.endTime}:00`);
    const breakStart = availability.breakTimeStart ? new Date(`${availability.date}T${availability.breakTimeStart}:00`) : null;
    const breakEnd = availability.breakTimeEnd ? new Date(`${availability.date}T${availability.breakTimeEnd}:00`) : null;

    let currentTime = start;
    const slots: DoctorTimeSlot[] = [];

    while (currentTime < end) {
      const slotEnd = new Date(currentTime.getTime() + 15 * 60 * 1000);

      const isDuringBreak = breakStart && breakEnd &&
        ((currentTime >= breakStart && currentTime < breakEnd) ||
          (slotEnd > breakStart && slotEnd <= breakEnd) ||
          (breakStart >= currentTime && breakStart < slotEnd));

      if (!isDuringBreak) {
        const slot = this.doctorTimeSlotRepository.create({
          availability: availability, // Pass the DoctorAvailability entity
          availabilityId: availability.id, // Also pass the ID for the foreign key column
          slotTime: currentTime.toTimeString().substring(0, 5),
          isBooked: false,
        });
        slots.push(slot);
      }
      currentTime = slotEnd;
    }
    await this.doctorTimeSlotRepository.save(slots);
  }

  async getDoctorAvailableTimeSlots(
    doctorId: number,
    date: string,
    page: number,
    limit: number,
  ): Promise<{ slots: DoctorTimeSlot[]; total: number; page: number; limit: number }> {
    const availability = await this.doctorAvailabilityRepository.findOne({
      where: { doctor: { id: doctorId }, date },
      relations: ['timeSlots'],
    });

    if (!availability) {
      return { slots: [], total: 0, page, limit };
    }

    const availableSlots = availability.timeSlots.filter(slot => !slot.isBooked);

    const sortedSlots = availableSlots.sort((a, b) => a.slotTime.localeCompare(b.slotTime));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSlots = sortedSlots.slice(startIndex, endIndex);

    return {
      slots: paginatedSlots,
      total: availableSlots.length,
      page,
      limit,
    };
  }
}
