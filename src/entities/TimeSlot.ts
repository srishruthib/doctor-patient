// src/entities/TimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from './Doctor';
import { Appointment } from './Appointment';

@Entity('time_slot')
export class TimeSlot {
    @PrimaryGeneratedColumn()
    slot_id!: number;

    @Column()
    day_of_week!: string;

    @Column()
    start_time!: string;

    @Column()
    end_time!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne('Doctor', (doctor: Doctor) => doctor.timeSlots)
    doctor!: Doctor;

    @OneToMany('Appointment', (appointment: Appointment) => appointment.slot)
    appointments!: Appointment[];
}
