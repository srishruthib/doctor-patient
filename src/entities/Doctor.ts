// src/entities/Doctor.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment';
import { DoctorAvailability } from './DoctorAvailability';
import { DoctorTimeSlot } from './DoctorTimeSlot';

@Entity('doctors')
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password_hash: string; // Store hashed password

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ nullable: true })
    specialization: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column({ nullable: true })
    address: string;

    @Column({ default: 'DOCTOR' }) // Default role for doctors
    role: string; // 'DOCTOR'

    @Column({
        type: 'enum',
        enum: ['stream', 'wave'],
        default: 'stream', // Default scheduling type
    })
    schedule_Type: 'stream' | 'wave'; // <--- ADD THIS NEW COLUMN

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];

    @OneToMany(() => DoctorAvailability, availability => availability.doctor)
    availabilities: DoctorAvailability[];

    @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor)
    timeSlots: DoctorTimeSlot[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
