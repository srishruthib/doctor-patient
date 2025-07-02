// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DoctorAvailability } from './DoctorAvailability';
import { Appointment } from './Appointment';

@Entity()
export class DoctorTimeSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DoctorAvailability, availability => availability.timeSlots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'availability_id' }) // Use snake_case for the foreign key column name
    availability: DoctorAvailability;

    @Column({ name: 'availability_id' }) // Explicitly map to availability_id column
    availabilityId: number;

    @Column({ type: 'time', name: 'slot_time' }) // Use snake_case for column name
    slotTime: string; // HH:MM

    @Column({ default: false, name: 'is_booked' }) // Use snake_case for column name
    isBooked: boolean;

    @OneToMany(() => Appointment, appointment => appointment.timeSlot) // Correct inverse side for Appointment
    appointments: Appointment[];
}
