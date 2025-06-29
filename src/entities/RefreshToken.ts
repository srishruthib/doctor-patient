// src/entities/RefreshToken.ts
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    // Removed ManyToOne and JoinColumn imports
} from 'typeorm';
// Removed Doctor, Patient, forwardRef imports

@Entity('refresh_token')
export class RefreshToken {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    token: string; // Hashed refresh token

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    revoked: boolean;

    // NEW: Add direct userId and userRole columns instead of TypeORM relations
    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'varchar', length: 20 })
    user_role: string; // 'doctor' or 'patient'

    // Removed ManyToOne relationships and JoinColumns

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
