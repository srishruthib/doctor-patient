// src/doctor/dto/create-doctor-availability.dto.ts
import { IsDateString, IsNotEmpty, IsString, IsArray, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';

export enum Session {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
}

export class CreateDoctorAvailabilityDto {
    @IsDateString()
    @IsNotEmpty()
    date: string; // ISO-MM-DD

    @IsString()
    @IsNotEmpty()
    start_time: string; // HH:MM:SS

    @IsString()
    @IsNotEmpty()
    end_time: string; // HH:MM:SS

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    weekdays?: string[]; // e.g., ['Monday', 'Tuesday']. Optional if 'date' is specific.

    @IsEnum(Session)
    @IsNotEmpty()
    session: Session; // 'morning', 'afternoon', 'evening'
}
