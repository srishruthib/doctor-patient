// src/entities/Doctor.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DoctorAvailability } from './DoctorAvailability';
import { Appointment } from './Appointment';

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string; // Hashed password

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    specialization: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column({ nullable: true })
    address: string;

    @Column({ default: 'DOCTOR' })
    role: string;

    @OneToMany(() => DoctorAvailability, availability => availability.doctor)
    availabilities: DoctorAvailability[];

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];

    // REMOVED: No direct OneToMany relationship to DoctorTimeSlot from Doctor
    // @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor)
    // timeSlots: DoctorTimeSlot[];
}
