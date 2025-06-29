// src/entities/DoctorTimeSlot.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
// NO import for Doctor needed here, as we are not using TypeORM's ManyToOne relation

@Entity('doctor_time_slot') // Table name in the database
// Add a unique constraint to prevent duplicate slots for the same doctor, date, and start_time
// We will enforce this manually in the service layer if database unique constraint causes issues.
@Unique(['doctor_id', 'date', 'start_time'])
export class DoctorTimeSlot {
    @PrimaryGeneratedColumn()
    slot_id: number;

    @Column({ type: 'int' }) // Simple column for doctor_id, no TypeORM ManyToOne relationship here
    doctor_id: number;

    @Column({ type: 'date' }) // The specific date of this time slot (e.g., '2025-06-27')
    date: string; // Stored as 'YYYY-MM-DD' string

    @Column({ type: 'time' }) // Start time of the individual slot (e.g., '09:00:00')
    start_time: string; // Stored as 'HH:MM:SS' string

    @Column({ type: 'time' }) // End time of the individual slot (e.g., '09:15:00')
    end_time: string; // Stored as 'HH:MM:SS' string

    @Column({ default: true }) // Indicates if the slot is available (true) or booked (false)
    is_available: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
