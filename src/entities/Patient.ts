// src/entities/Patient.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn()
    id: number; // Primary key is 'id'

    @Column()
    first_name: string | null; // Changed to allow null

    @Column()
    last_name: string | null; // Changed to allow null

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    googleId?: string;

    @Column({ default: 'local' })
    provider: string;

    @Column({ default: 'patient' })
    role: string;

    @Column({ nullable: true })
    phone_number: string | null; // Changed to allow null

    @Column({ nullable: true })
    address: string | null; // Changed to allow null

    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
