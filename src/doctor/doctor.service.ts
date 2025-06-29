// src/doctor/doctor.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

// REMOVED: dayjs imports

import { Doctor } from '../entities/Doctor';
import { DoctorAvailability } from '../entities/DoctorAvailability';
import { DoctorTimeSlot } from '../entities/DoctorTimeSlot';
// CORRECTED PATH: Should be relative from src/doctor/ to src/doctor/dcd ..
// to/
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class DoctorService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        @InjectRepository(DoctorAvailability)
        private readonly doctorAvailabilityRepository: Repository<DoctorAvailability>,
        @InjectRepository(DoctorTimeSlot)
        private readonly doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
    ) { }

    /**
     * Helper function to parse 'HH:MM:SS' or 'HH:MM' string to a Date object with a dummy date.
     * This is useful for time-only comparisons.
     */
    private parseTime(timeString: string): Date {
        const [hours, minutes, seconds = '00'] = timeString.split(':');
        const d = new Date();
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10), 0);
        return d;
    }

    /**
     * Helper function to format a Date object into 'HH:MM:SS' string.
     */
    private formatTime(date: Date): string {
        return date.toTimeString().slice(0, 8); // Extracts HH:MM:SS
    }

    /**
     * Finds all doctors, with optional search by name or specialization.
     * @param name Optional: Search by doctor's first_name or last_name.
     * @param specialization Optional: Search by doctor's specialization.
     * @returns A list of doctors matching the criteria.
     */
    async findAllDoctors(name?: string, specialization?: string): Promise<Doctor[]> {
        const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');

        if (name) {
            queryBuilder.andWhere(
                '(doctor.first_name ILIKE :name OR doctor.last_name ILIKE :name)',
                { name: `%${name}%` },
            );
        }

        if (specialization) {
            queryBuilder.andWhere('doctor.specialization ILIKE :specialization', {
                specialization: `%${specialization}%`,
            });
        }

        return queryBuilder.getMany();
    }

    /**
     * Finds a single doctor by their ID.
     * @param doctorId The ID of the doctor to find.
     * @returns The doctor object if found, otherwise throws NotFoundException.
     */
    async findDoctorById(doctorId: number): Promise<Doctor> {
        const doctor = await this.doctorRepository.findOne({
            where: { doctor_id: doctorId },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
        }

        return doctor;
    }

    /**
     * Allows a doctor to set their availability for a specific date and generates time slots.
     * @param doctorId The ID of the doctor setting availability.
     * @param dto The CreateAvailabilityDto containing availability details.
     * @returns The saved DoctorAvailability and generated DoctorTimeSlots.
     */
    async setDoctorAvailability(doctorId: number, dto: CreateAvailabilityDto): Promise<{ availability: DoctorAvailability, slots: DoctorTimeSlot[] }> {
        // 1. Validate Doctor Existence
        const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId } });
        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
        }

        // 2. Validate Date and Time Logic (Add-on: Prevent past dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today

        const availabilityDate = new Date(dto.date);
        availabilityDate.setHours(0, 0, 0, 0); // Normalize to start of availability date

        if (availabilityDate.getTime() < today.getTime()) {
            throw new BadRequestException('Availability date cannot be in the past.');
        }

        const startTime = this.parseTime(dto.start_time);
        const endTime = this.parseTime(dto.end_time);

        if (endTime.getTime() <= startTime.getTime()) {
            throw new BadRequestException('End time must be after start time.');
        }

        // Optional: Validate if provided date matches any of the weekdays, if weekdays are specified.
        if (dto.weekdays && dto.weekdays.length > 0) {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = daysOfWeek[new Date(dto.date).getDay()];
            if (!dto.weekdays.includes(dayOfWeek)) {
                throw new BadRequestException(`The provided date (${dto.date}) is a ${dayOfWeek}, which is not in the specified available weekdays: ${dto.weekdays.join(', ')}.`);
            }
        }

        // 3. Save to DoctorAvailability table
        // Check for existing availability block for the same doctor, date, and session
        const existingAvailability = await this.doctorAvailabilityRepository.findOne({
            where: {
                doctor_id: doctorId,
                date: dto.date,
                session: dto.session,
            },
        });

        if (existingAvailability) {
            throw new ConflictException(`Availability already set for doctor ${doctorId} on ${dto.date} for session ${dto.session}.`);
        }

        const newAvailability = this.doctorAvailabilityRepository.create({
            doctor_id: doctorId,
            date: dto.date,
            start_time: dto.start_time,
            end_time: dto.end_time,
            weekdays: dto.weekdays || [],
            session: dto.session,
        });
        const savedAvailability = await this.doctorAvailabilityRepository.save(newAvailability);

        // 4. Divide time intervals and Store in DoctorTimeSlots table
        const slotDurationMinutes = 15; // Define standard slot duration (e.g., 15 minutes)
        let currentTime = startTime;
        const generatedSlots: DoctorTimeSlot[] = [];

        while (currentTime.getTime() < endTime.getTime()) {
            const slotStartTime = this.formatTime(currentTime);

            const nextTime = new Date(currentTime.getTime());
            nextTime.setMinutes(currentTime.getMinutes() + slotDurationMinutes);

            const slotEndTime = this.formatTime(nextTime);

            // Prevent generating slots that go beyond the end_time for the last interval
            if (nextTime.getTime() > endTime.getTime() && nextTime.getTime() !== endTime.getTime()) {
                break;
            }

            const newSlot = this.doctorTimeSlotRepository.create({
                doctor_id: doctorId,
                date: dto.date,
                start_time: slotStartTime,
                end_time: slotEndTime,
                is_available: true,
            });

            try {
                const savedSlot = await this.doctorTimeSlotRepository.save(newSlot);
                generatedSlots.push(savedSlot);
            } catch (error: any) {
                if (error.code === '23505') { // PostgreSQL unique_violation error code
                    console.warn(`Skipping duplicate slot for doctor ${doctorId} on ${dto.date} from ${slotStartTime}.`);
                } else {
                    throw new InternalServerErrorException(`Failed to save time slot: ${error.message}`);
                }
            }

            currentTime = nextTime;
        }

        return { availability: savedAvailability, slots: generatedSlots };
    }

    /**
     * Allows patients to view a doctor's availability (time slots).
     * @param doctorId The ID of the doctor whose availability is being viewed.
     * @param date Optional: Filter by specific date (YYYY-MM-DD).
     * @param page Optional: Page number for pagination (default 1).
     * @param limit Optional: Number of items per page for pagination (default 10).
     * @returns A paginated list of available time slots.
     */
    async getDoctorAvailableTimeSlots(
        doctorId: number,
        date?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ slots: DoctorTimeSlot[], total: number, page: number, limit: number }> {
        const queryBuilder = this.doctorTimeSlotRepository.createQueryBuilder('slot');

        queryBuilder
            .where('slot.doctor_id = :doctorId', { doctorId })
            .andWhere('slot.is_available = :isAvailable', { isAvailable: true });

        if (date) {
            // Basic date format validation forYYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
            }
            queryBuilder.andWhere('slot.date = :date', { date });
        } else {
            // If no date is provided, only show future slots
            const today = new Date();
            const todayFormatted = today.toISOString().slice(0, 10); //YYYY-MM-DD
            const currentTimeFormatted = this.formatTime(today); // HH:MM:SS

            queryBuilder.andWhere(
                '(slot.date > :today OR (slot.date = :today AND slot.start_time >= :currentTime))',
                { today: todayFormatted, currentTime: currentTimeFormatted }
            );
        }

        // Add-on: Pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Add-on: Order slots for better readability
        queryBuilder.orderBy('slot.date', 'ASC').addOrderBy('slot.start_time', 'ASC');

        const [slots, total] = await queryBuilder.getManyAndCount();

        return {
            slots,
            total,
            page,
            limit,
        };
    }
}
