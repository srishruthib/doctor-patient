// src/entities/Appointment.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Doctor } from './Doctor';
import { Patient } from './Patient';
import { DoctorTimeSlot } from './DoctorTimeSlot'; // Changed from './TimeSlot' to './DoctorTimeSlot' assuming this is the correct TimeSlot entity

@Entity('appointments') // Assuming you want a table named 'appointments'
export class Appointment {
    @PrimaryGeneratedColumn()
    appointment_id!: number;

    // Foreign key columns
    @Column()
    doctor_id!: number;

    @Column()
    patient_id!: number;

    @Column()
    slot_id!: number; // Assuming you link to DoctorTimeSlot by its ID

    @ManyToOne(() => Doctor, doctor => doctor.appointments)
    @JoinColumn({ name: 'doctor_id' }) // Explicitly define foreign key column
    doctor!: Doctor;

    @ManyToOne(() => Patient, patient => patient.appointments)
    @JoinColumn({ name: 'patient_id' }) // Explicitly define foreign key column
    patient!: Patient;

    @ManyToOne(() => DoctorTimeSlot, timeSlot => timeSlot.appointments) // Corrected entity reference
    @JoinColumn({ name: 'slot_id' }) // Explicitly define foreign key column
    slot!: DoctorTimeSlot; // Changed type to DoctorTimeSlot

    @Column({ type: 'date' }) // Store date as a proper date type
    appointment_date!: string;

    @Column()
    time_slot_value!: string; // This column might store "09:00 - 09:15" if you prefer string representation

    @Column()
    appointment_status!: string; // e.g., 'pending', 'confirmed', 'cancelled', 'completed'

    @Column({ nullable: true })
    reason?: string; // Made optional with '?' and nullable true

    @Column({ nullable: true })
    notes?: string; // Made optional with '?' and nullable true

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
