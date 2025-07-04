// src/entities/DoctorTimeSlot.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Doctor } from './Doctor';
import { DoctorAvailability } from './DoctorAvailability'; // <--- NEW IMPORT
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

    // Link to DoctorAvailability
    @Column()
    doctor_availability_id: number; // Foreign key to DoctorAvailability

    @ManyToOne(() => DoctorAvailability, availability => availability.timeSlots) // <--- NEW RELATIONSHIP
    @JoinColumn({ name: 'doctor_availability_id' }) // Specifies the foreign key column
    doctor_availability: DoctorAvailability; // <--- NEW PROPERTY

    @Column({ type: 'time' }) // This will be the 30-min slot time
    slot_time: string;

    @Column({ default: true })
    is_available: boolean;

    @OneToMany(() => Appointment, appointment => appointment.slot)
    appointments: Appointment[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
