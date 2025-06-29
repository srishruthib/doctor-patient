// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Doctor } from './Doctor';
import { Appointment } from './Appointment';

@Entity('doctor_time_slots')
export class DoctorTimeSlot {
    @PrimaryGeneratedColumn()
    slot_id: number;

    @Column()
    doctor_id: number;

    @ManyToOne(() => Doctor, doctor => doctor.timeSlots)
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ default: true })
    is_available: boolean;

    @OneToMany(() => Appointment, appointment => appointment.slot)
    appointments: Appointment[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
