// src/entities/RefreshToken.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './Doctor'; // Assuming you have these entities
import { Patient } from './Patient'; // Assuming you have these entities

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number; // The ID of the user (Doctor or Patient)

    @Column()
    token: string; // Hashed refresh token

    @Column()
    role: string; // 'DOCTOR' or 'PATIENT' (string representation of the Role enum)

    @Column({ type: 'timestamp' }) // Added this line for expiresAt
    expiresAt: Date;

    // Optional: Add relations if needed for TypeORM to manage them
    // @ManyToOne(() => Doctor, doctor => doctor.refreshTokens, { nullable: true, onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'userId' }) // Link to the userId column
    // doctor: Doctor;

    // @ManyToOne(() => Patient, patient => patient.refreshTokens, { nullable: true, onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'userId' }) // Link to the userId column
    // patient: Patient;
}
