// src/availability/dto/create-availability.dto.ts
import { IsDateString, IsString, IsArray, ArrayMinSize, IsIn, IsNotEmpty, Matches } from 'class-validator'; // <--- ADDED 'Matches'

export class CreateAvailabilityDto {
    @IsNotEmpty()
    @IsDateString({ strict: true }) // Ensures YYYY-MM-DD format
    date: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'start_time must be in HH:mm format' })
    start_time: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'end_time must be in HH:mm format' })
    end_time: string;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    weekdays: string[]; // e.g., ["Monday", "Tuesday"]

    @IsNotEmpty()
    @IsString()
    @IsIn(['Morning', 'Evening', 'Full Day']) // Define allowed sessions
    session: 'Morning' | 'Evening' | 'Full Day';
}
