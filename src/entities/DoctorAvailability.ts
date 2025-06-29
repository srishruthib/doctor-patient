// src/entities/DoctorAvailability.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './Doctor'; // <--- Make sure this import is correct

@Entity('doctor_availabilities')
export class DoctorAvailability {
    @PrimaryGeneratedColumn()
    id: number;

    // This is the foreign key column that links to the Doctor entity's primary key (id)
    @Column()
    doctor_id: number;

    // Many availabilities belong to one doctor
    @ManyToOne(() => Doctor, doctor => doctor.availabilities) // <--- ADD OR UPDATE THIS BLOCK
    @JoinColumn({ name: 'doctor_id' }) // This specifies which column is the foreign key
    doctor: Doctor; // <--- This is the property that was missing/causing the error

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ type: 'jsonb', nullable: true })
    weekdays: string[]; // ['Monday', 'Tuesday']

    @Column()
    session: string; // 'morning', 'afternoon', 'evening'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
