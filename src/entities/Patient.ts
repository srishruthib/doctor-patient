// src/entities/Patient.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment'; // Import Appointment

@Entity('patients')
export class Patient {
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

    @Column({ default: 'patient' })
    role: string; // 'doctor' or 'patient'

    @Column({ nullable: true })
    phone_number: string;

    @Column({ nullable: true })
    address: string;

    // Add OneToMany relationship here
    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[]; // <--- ADD THIS LINE FOR APPOINTMENTS

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
