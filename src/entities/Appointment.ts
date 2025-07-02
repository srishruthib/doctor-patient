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
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    @Column()
    patientId: number;

    @ManyToOne(() => Doctor, doctor => doctor.appointments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;

    @Column()
    doctorId: number;

    // Corrected ManyToOne relationship to DoctorTimeSlot
    // DoctorTimeSlot does not have an 'appointments' property.
    // We link to the DoctorTimeSlot entity itself.
    @ManyToOne(() => DoctorTimeSlot, timeSlot => timeSlot.id, { onDelete: 'CASCADE' }) // Using timeSlot.id as the inverse side property
    @JoinColumn({ name: 'timeSlotId' })
    timeSlot: DoctorTimeSlot;

    @Column()
    timeSlotId: number;

    @Column({ type: 'date' })
    appointmentDate: string; // ISO 8601 format: YYYY-MM-DD

    @Column({ type: 'time' })
    appointmentTime: string; // HH:MM

    @Column({ default: 'scheduled' })
    status: string; // e.g., 'scheduled', 'completed', 'cancelled'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
