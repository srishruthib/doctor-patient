// src/entities/DoctorAvailability.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { StringArrayTransformer, SessionType } from './common'; // Import from common.ts

@Entity('doctor_availability') // Table name in the database
export class DoctorAvailability {
    @PrimaryGeneratedColumn()
    availability_id: number;

    @Column({ type: 'int' }) // Simple column for doctor_id, no TypeORM ManyToOne relationship here
    doctor_id: number;

    @Column({ type: 'date' }) // The specific date for this availability block (e.g., '2025-07-01')
    date: string; // Stored as 'YYYY-MM-DD' string for consistency with date inputs

    @Column({ type: 'time' }) // Start time of the availability block (e.g., '09:00:00')
    start_time: string; // Stored as 'HH:MM:SS' string

    @Column({ type: 'time' }) // End time of the availability block (e.g., '17:00:00')
    end_time: string; // Stored as 'HH:MM:SS' string

    @Column({
        type: 'varchar', // Store weekdays as a JSON string array
        transformer: new StringArrayTransformer(),
        nullable: true, // Can be null if it's a specific date, not recurring availability
    })
    weekdays: string[]; // e.g., ['Monday', 'Wednesday']

    @Column({ type: 'enum', enum: SessionType })
    session: SessionType; // 'Morning', 'Evening', 'Full Day'

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
