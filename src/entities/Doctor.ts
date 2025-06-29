// src/entities/Doctor.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment'; // Import Appointment
import { DoctorAvailability } from './DoctorAvailability'; // Import DoctorAvailability
import { DoctorTimeSlot } from './DoctorTimeSlot'; // Import DoctorTimeSlot

@Entity('doctors')
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password?: string; // Optional for Google OAuth users

    @Column({ nullable: true })
    googleId?: string; // For Google OAuth

    @Column({ default: 'local' })
    provider: string; // 'local' or 'google'

    @Column({ default: 'doctor' })
    role: string; // 'doctor' or 'patient'

    @Column({ nullable: true })
    phone_number: string;

    @Column({ nullable: true })
    specialization: string;

    @Column({ nullable: true })
    experience_years: number;

    @Column({ nullable: true })
    education: string;

    @Column({ nullable: true })
    clinic_name: string;

    @Column({ nullable: true })
    clinic_address: string;

    // Add OneToMany relationships here
    @OneToMany(() => DoctorAvailability, availability => availability.doctor)
    availabilities: DoctorAvailability[]; // Added for doctor's availabilities

    @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor)
    timeSlots: DoctorTimeSlot[]; // <--- ADD THIS LINE FOR TIME SLOTS

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[]; // <--- ADD THIS LINE FOR APPOINTMENTS

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
