// src/doctor/doctor.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Doctor } from '../entities/Doctor';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto'; // FIX: Corrected import path (relative to src/doctor)
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
import dayjs from 'dayjs';

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
        @InjectRepository(DoctorAvailability)
        private doctorAvailabilityRepository: Repository<DoctorAvailability>,
        @InjectRepository(DoctorTimeSlot)
        private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
    ) { }

    async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const doctor = this.doctorRepository.create(createDoctorDto);
        return this.doctorRepository.save(doctor);
    }

    async findAllDoctors(name?: string, specialization?: string): Promise<Doctor[]> {
        const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');

        if (name) {
            queryBuilder.andWhere(
                '(LOWER(doctor.first_name) LIKE LOWER(:name) OR LOWER(doctor.last_name) LIKE LOWER(:name))',
                { name: `%${name}%` },
            );
        }

        if (specialization) {
            queryBuilder.andWhere('LOWER(doctor.specialization) LIKE LOWER(:specialization)', {
                specialization: `%${specialization}%`,
            });
        }

        return queryBuilder.getMany();
    }

    async findDoctorById(id: number): Promise<Doctor> {
        const doctor = await this.doctorRepository.findOne({ where: { id } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not醐not found`);
        }
        return doctor;
    }

    async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        const doctor = await this.doctorRepository.findOne({ where: { id } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        Object.assign(doctor, updateDoctorDto);
        return this.doctorRepository.save(doctor);
    }

    async remove(id: number): Promise<void> {
        const result = await this.doctorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }
    }

    async setDoctorAvailability(
        doctorId: number,
        createAvailabilityDto: CreateDoctorAvailabilityDto,
    ): Promise<DoctorAvailability> {
        const doctor = await this.findDoctorById(doctorId);

        const { date, start_time, end_time, weekdays, session } = createAvailabilityDto;

        const existingAvailability = await this.doctorAvailabilityRepository.findOne({
            where: {
                doctor: { id: doctorId },
                date: date,
                session: session,
            },
        });

        if (existingAvailability) {
            throw new BadRequestException('Availability already set for this date and session.');
        }

        const availability = this.doctorAvailabilityRepository.create({
            doctor,
            date,
            start_time,
            end_time,
            weekdays,
            session,
        });

        const savedAvailability = await this.doctorAvailabilityRepository.save(availability);
        await this.generateTimeSlotsForAvailability(savedAvailability);

        return savedAvailability;
    }

    private async generateTimeSlotsForAvailability(availability: DoctorAvailability): Promise<void> {
        const { doctor, date, start_time, end_time } = availability;
        const slotDurationMinutes = 15;

        let currentSlotTime = dayjs(`${date}T${start_time}`);
        const endTime = dayjs(`${date}T${end_time}`);

        const newTimeSlots: DoctorTimeSlot[] = [];

        while (currentSlotTime.isBefore(endTime)) {
            const slotEndTime = currentSlotTime.add(slotDurationMinutes, 'minute');

            if (slotEndTime.isAfter(endTime) && !slotEndTime.isSame(endTime)) {
                break;
            }

            const timeSlot = this.doctorTimeSlotRepository.create({
                doctor,
                date: date,
                start_time: currentSlotTime.format('HH:mm:ss'),
                end_time: slotEndTime.format('HH:mm:ss'),
                is_available: true,
            });
            newTimeSlots.push(timeSlot);

            currentSlotTime = slotEndTime;
        }
        if (newTimeSlots.length > 0) {
            await this.doctorTimeSlotRepository.save(newTimeSlots);
        }
    }

    async getDoctorAvailableTimeSlots(
        doctorId: number,
        date: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: DoctorTimeSlot[]; total: number; page: number; last_page: number }> {
        const [slots, total] = await this.doctorTimeSlotRepository.findAndCount({
            where: {
                doctor: { id: doctorId },
                date: date,
                is_available: true,
            },
            order: {
                start_time: 'ASC',
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        const last_page = Math.ceil(total / limit);

        return {
            data: slots,
            total,
            page,
            last_page,
        };
    }
}
