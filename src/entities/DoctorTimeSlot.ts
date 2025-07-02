// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DoctorAvailability } from './DoctorAvailability';

@Entity()
export class DoctorTimeSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DoctorAvailability, availability => availability.timeSlots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'availability_id' }) // Use snake_case for the foreign key column name
    availability: DoctorAvailability; // This is the relationship property

    @Column({ name: 'availability_id' }) // Explicitly map to availability_id column
    availabilityId: number; // This is the actual foreign key property

    @Column({ type: 'time', name: 'slot_time' }) // Use snake_case for column name
    slotTime: string; // HH:MM

    @Column({ default: false, name: 'is_booked' }) // Use snake_case for column name
    isBooked: boolean;
}
