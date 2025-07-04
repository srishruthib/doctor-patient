// src/entities/DoctorAvailability.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'; // <--- Added OneToMany
import { Doctor } from './Doctor';
import { DoctorTimeSlot } from './DoctorTimeSlot'; // <--- NEW IMPORT

@Entity('doctor_availabilities')
export class DoctorAvailability {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    doctor_id: number; // Foreign key column

    @ManyToOne(() => Doctor, doctor => doctor.availabilities)
    @JoinColumn({ name: 'doctor_id' }) // Specifies the foreign key column
    doctor: Doctor;

    @Column({ type: 'date' })
    date: string; // ISO-MM-DD

    @Column({ type: 'time' })
    start_time: string; // HH:MM:SS

    @Column({ type: 'time' })
    end_time: string; // HH:MM:SS

    @Column({ type: 'jsonb', nullable: true })
    weekdays: string[]; // e.g., ['Monday', 'Tuesday']

    @Column()
    session: string; // 'morning', 'afternoon', 'evening'

    @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor_availability) // <--- NEW RELATIONSHIP
    timeSlots: DoctorTimeSlot[]; // <--- NEW PROPERTY

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
