// src/entities/Patient.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    // Removed OneToMany import
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
// Removed RefreshToken import

@Entity('patient')
export class Patient {
    @PrimaryGeneratedColumn()
    patient_id: number;

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

    @Column({ type: 'varchar', length: 20, default: 'patient' })
    role: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string | null;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    // Removed relationship to RefreshToken
    // refreshTokens: RefreshToken[];
}
