// src/entities/Doctor.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    // Removed OneToMany import
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
// Removed RefreshToken import
// Removed StringArrayTransformer and SessionType imports as they are not defined in this stable revert version

@Entity('doctor')
export class Doctor {
    @PrimaryGeneratedColumn()
    doctor_id: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    first_name: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    last_name: string | null;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    password: string | null;

    @Column({ type: 'varchar', nullable: true })
    googleId: string | null;

    @Column({ type: 'varchar', default: 'local' })
    provider: string;

    @Column({ type: 'varchar', length: 20, default: 'doctor' })
    role: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    specialization: string | null;

    @Column({ type: 'int', nullable: true })
    experience_years: number | null;

    @Column({ type: 'text', nullable: true })
    education: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    clinic_name: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    clinic_address: string | null;

    // Assuming these columns were working correctly with a global or removed transformer
    @Column({
        type: 'varchar',
        nullable: true,
    })
    available_days: string[] | null;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    available_time_slots: string[] | null;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    // Removed relationship to RefreshToken
    // refreshTokens: RefreshToken[];
}
