// src/entities/DoctorAvailability.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Doctor } from './Doctor';
import { DoctorTimeSlot } from './DoctorTimeSlot';

@Entity()
export class DoctorAvailability {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Doctor, doctor => doctor.availabilities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctor_id' }) // Use snake_case for the foreign key column name
    doctor: Doctor; // This is the relationship property

    @Column({ name: 'doctor_id' }) // Explicitly map to doctor_id column
    doctorId: number; // This is the actual foreign key property

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ type: 'time', name: 'start_time' }) // Use snake_case for column name
    startTime: string; // HH:MM (camelCase property for code)

    @Column({ type: 'time', name: 'end_time' }) // Use snake_case for column name
    endTime: string; // HH:MM (camelCase property for code)

    @Column({ type: 'time', nullable: true, name: 'break_time_start' }) // Use snake_case for column name
    breakTimeStart: string; // HH:MM (camelCase property for code)

    @Column({ type: 'time', nullable: true, name: 'break_time_end' }) // Use snake_case for column name
    breakTimeEnd: string; // HH:MM (camelCase property for code)

    @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.availability)
    timeSlots: DoctorTimeSlot[]; // This defines the relationship array
}
