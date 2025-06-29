// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './Doctor'; // <--- Make sure this import is correct

@Entity('doctor_time_slots')
export class DoctorTimeSlot {
    @PrimaryGeneratedColumn()
    slot_id: number;

    // This is the foreign key column that links to the Doctor entity's primary key (id)
    @Column()
    doctor_id: number;

    // Many time slots belong to one doctor
    @ManyToOne(() => Doctor, doctor => doctor.timeSlots) // <--- ADD OR UPDATE THIS BLOCK
    @JoinColumn({ name: 'doctor_id' }) // This specifies which column is the foreign key
    doctor: Doctor; // <--- This is the property that was missing/causing the error

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ type: 'time' })
    start_time: string; // HH:MM:SS

    @Column({ type: 'time' })
    end_time: string; // HH:MM:SS

    @Column({ default: true })
    is_available: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
