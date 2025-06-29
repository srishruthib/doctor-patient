// src/entities/Appointment.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from './Doctor';
import { Patient } from './Patient';
import { TimeSlot } from './TimeSlot';

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    appointment_id!: number;

    @Column()
    appointment_date!: string;

    @Column()
    time_slot!: string;

    @Column()
    appointment_status!: string;

    @Column({ nullable: true })
    reason!: string;

    @Column({ nullable: true })
    notes!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne('Doctor', (doctor: Doctor) => doctor.appointments)
    doctor!: Doctor;

    @ManyToOne('Patient', (patient: Patient) => patient.appointments)
    patient!: Patient;

    @ManyToOne('TimeSlot', (timeSlot: TimeSlot) => timeSlot.appointments)
    slot!: TimeSlot;
}
