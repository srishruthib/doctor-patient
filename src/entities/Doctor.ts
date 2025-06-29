// src/entities/Doctor.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment';
import { DoctorAvailability } from './DoctorAvailability';
import { DoctorTimeSlot } from './DoctorTimeSlot';

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
    password?: string;

    @Column({ nullable: true })
    googleId?: string;

    @Column({ default: 'local' })
    provider: string;

    @Column({ default: 'doctor' })
    role: string;

    @Column({ nullable: true })
    phone_number: string | null;

    @Column({ nullable: true })
    specialization: string | null;

    @Column({ nullable: true })
    experience_years: number | null;

    @Column({ nullable: true })
    education: string | null;

    @Column({ nullable: true })
    clinic_name: string | null;

    @Column({ nullable: true })
    clinic_address: string | null;

    @OneToMany(() => DoctorAvailability, availability => availability.doctor)
    availabilities: DoctorAvailability[];

    @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor)
    timeSlots: DoctorTimeSlot[];

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
