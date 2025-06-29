// src/entities/RefreshToken.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../auth/dto/auth-signup.dto'; // Import Role enum

@Entity('refresh_tokens') // Assuming your table is named 'refresh_tokens'
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number; // The ID of the user (doctor or patient)

    @Column()
    token: string; // Hashed refresh token

    @Column({ default: false })
    revoked: boolean;

    @Column({
        type: 'enum', // Define as enum type for PostgreSQL
        enum: Role,   // Use the imported Role enum
        nullable: false, // Role should always be present
    })
    role: Role; // <-- ADD THIS NEW PROPERTY: Stores 'doctor' or 'patient' role

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
