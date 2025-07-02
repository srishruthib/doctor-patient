// src/entities/Appointment.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';
import { Doctor } from './Doctor';
import { DoctorTimeSlot } from './DoctorTimeSlot';

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Patient, patient => patient.appointments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' }) // Use snake_case for the foreign key column name
    patient: Patient;

    @Column({ name: 'patient_id' }) // Explicitly map to patient_id column
    patientId: number;

    @ManyToOne(() => Doctor, doctor => doctor.appointments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctor_id' }) // Use snake_case for the foreign key column name
    doctor: Doctor;

    @Column({ name: 'doctor_id' }) // Explicitly map to doctor_id column
    doctorId: number;

    @ManyToOne(() => DoctorTimeSlot, timeSlot => timeSlot.appointments, { onDelete: 'CASCADE' }) // Corrected inverse side
    @JoinColumn({ name: 'time_slot_id' }) // Use snake_case for the foreign key column name
    timeSlot: DoctorTimeSlot;

    @Column({ name: 'time_slot_id' }) // Explicitly map to time_slot_id column
    timeSlotId: number;

    @Column({ type: 'date', name: 'appointment_date' }) // Use snake_case for column name
    appointmentDate: string; // ISO 8601 format:YYYY-MM-DD

    @Column({ type: 'time', name: 'appointment_time' }) // Use snake_case for column name
    appointmentTime: string; // HH:MM

    @Column({ default: 'scheduled' })
    status: string; // e.g., 'scheduled', 'completed', 'cancelled'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' }) // Use snake_case
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' }) // Use snake_case
    updatedAt: Date;
}
