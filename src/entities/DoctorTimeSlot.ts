// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'; // Make sure OneToMany is imported
import { Doctor } from './Doctor';
import { Appointment } from './Appointment'; // <--- NEW: Import Appointment entity

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
    date: string; // ISO-MM-DD

    @Column({ type: 'time' })
    start_time: string; // HH:MM:SS

    @Column({ type: 'time' })
    end_time: string; // HH:MM:SS

    @Column({ default: true })
    is_available: boolean;

    // Add OneToMany relationship to Appointment
    @OneToMany(() => Appointment, appointment => appointment.slot) // <--- ADD THIS LINE FOR APPOINTMENTS
    appointments: Appointment[]; // <--- ADD THIS LINE FOR APPOINTMENTS

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
