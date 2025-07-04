// src/availability/availability.service.ts
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
import { Doctor } from '../entities/Doctor';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import * as moment from 'moment'; // For date/time manipulation

@Injectable()
export class AvailabilityService {
    constructor(
        @InjectRepository(DoctorAvailability)
        private doctorAvailabilityRepository: Repository<DoctorAvailability>,
        @InjectRepository(DoctorTimeSlot)
        private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
    ) { }

    async setDoctorAvailability(
        doctorId: number,
        createAvailabilityDto: CreateAvailabilityDto,
    ): Promise<DoctorAvailability> {
        const { date, start_time, end_time, weekdays, session } = createAvailabilityDto;

        // 1. Validate Doctor Exists
        const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
        }

        // 2. Validate date is not in the past
        const availabilityDateMoment = moment(date, 'YYYY-MM-DD');
        if (!availabilityDateMoment.isValid()) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
        }
        if (availabilityDateMoment.isBefore(moment(), 'day')) {
            throw new BadRequestException('Availability date cannot be in the past.');
        }

        // 3. Validate time format and order
        const startTimeMoment = moment(start_time, 'HH:mm');
        const endTimeMoment = moment(end_time, 'HH:mm');

        if (!startTimeMoment.isValid() || !endTimeMoment.isValid()) {
            throw new BadRequestException('Invalid time format. Use HH:mm (e.g., 09:00).');
        }
        if (startTimeMoment.isSameOrAfter(endTimeMoment)) {
            throw new BadRequestException('Start time must be before end time.');
        }

        // 4. Prevent duplicate availability for the same doctor/date/time range
        const existingAvailability = await this.doctorAvailabilityRepository.findOne({
            where: {
                doctor: { id: doctorId },
                date: date, // Use string format for comparison
                start_time: start_time,
                end_time: end_time,
            },
        });

        if (existingAvailability) {
            throw new ConflictException('Duplicate availability entry for this doctor, date, and time range.');
        }

        // 5. Save to doctor_availabilities table
        const doctorAvailability = this.doctorAvailabilityRepository.create({
            doctor,
            date: date, // <--- Use string format directly from DTO
            start_time,
            end_time,
            weekdays,
            session,
        });
        await this.doctorAvailabilityRepository.save(doctorAvailability);

        // 6. Divide the time intervals and store in doctor_time_slots table
        const slots: DoctorTimeSlot[] = [];
        let currentSlotTime = startTimeMoment.clone();

        while (currentSlotTime.isBefore(endTimeMoment)) {
            const slotEndTime = currentSlotTime.clone().add(30, 'minutes'); // 30-minute slots
            if (slotEndTime.isAfter(endTimeMoment)) {
                break; // Avoid creating partial slots at the very end
            }

            const timeSlot = this.doctorTimeSlotRepository.create({
                doctor_availability: doctorAvailability, // <--- Correctly assigning the DoctorAvailability object
                doctor, // Also assign the doctor object
                slot_time: currentSlotTime.format('HH:mm'),
                is_available: true, // Initially available
            });
            slots.push(timeSlot);
            currentSlotTime = slotEndTime;
        }

        if (slots.length === 0) {
            throw new BadRequestException('No valid time slots could be generated for the given time range.');
        }

        await this.doctorTimeSlotRepository.save(slots);

        return doctorAvailability;
    }

    async getDoctorAvailability(
        doctorId: number,
        date?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ slots: DoctorTimeSlot[]; total: number }> {
        // 1. Validate Doctor Exists
        const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
        }

        const queryBuilder = this.doctorTimeSlotRepository.createQueryBuilder('slot')
            .leftJoinAndSelect('slot.doctor', 'doctor')
            .leftJoinAndSelect('slot.doctor_availability', 'doctorAvailability') // Join with DoctorAvailability
            .where('slot.doctor.id = :doctorId', { doctorId })
            .andWhere('slot.is_available = :isAvailable', { isAvailable: true });

        if (date) {
            const queryDateMoment = moment(date, 'YYYY-MM-DD');
            if (!queryDateMoment.isValid()) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
            }
            // Filter by date from the joined doctor_availability
            queryBuilder.andWhere('doctorAvailability.date = :date', { date: date }); // Use string format for query
        }

        // Add pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Order by date and then slot time for consistent results
        queryBuilder.orderBy('doctorAvailability.date', 'ASC'); // Order by DoctorAvailability date
        queryBuilder.addOrderBy('slot.slot_time', 'ASC');


        const [slots, total] = await queryBuilder.getManyAndCount();

        return { slots, total };
    }
}
