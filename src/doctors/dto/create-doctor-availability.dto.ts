// src/doctors/dto/create-doctor-availability.dto.ts
import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

export class CreateDoctorAvailabilityDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
    date: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
    startTime: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
    endTime: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
    breakTimeStart?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' })
    breakTimeEnd?: string;
}
