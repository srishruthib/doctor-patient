// src/doctor/dto/create-availability.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsEnum,
    Matches,
    IsOptional,
    IsDateString, // For date validation
    ValidateIf, // For conditional validation
} from 'class-validator';
import { SessionType } from '../../entities/common'; // Import SessionType enum

export class CreateAvailabilityDto {
    @IsNotEmpty({ message: 'Date is required.' })
    @IsDateString({}, { message: 'Date must be a valid date string (YYYY-MM-DD).' })
    // Custom validation to ensure date is not in the past
    // Note: This relies on the server's current date. For client-side validation, frontend should handle.
    // We'll add logic in the service to properly validate against past dates.
    date: string; // Expected format: YYYY-MM-DD

    @IsNotEmpty({ message: 'Start time is required.' })
    @IsString({ message: 'Start time must be a string.' })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Start time must be in HH:MM or HH:MM:SS format.',
    })
    start_time: string; // Expected format: HH:MM or HH:MM:SS

    @IsNotEmpty({ message: 'End time is required.' })
    @IsString({ message: 'End time must be a string.' })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'End time must be in HH:MM or HH:MM:SS format.',
    })
    end_time: string; // Expected format: HH:MM or HH:MM:SS

    @IsOptional()
    @IsArray({ message: 'Weekdays must be an array.' })
    @IsString({ each: true, message: 'Each weekday must be a string.' })
    @ArrayMinSize(1, { message: 'At least one weekday must be provided if setting recurring availability.' })
    // Validate that if weekdays are provided, the date might be less important for recurrence,
    // but we're treating 'date' as a specific instance for now.
    weekdays?: string[]; // e.g., ['Monday', 'Tuesday']

    @IsNotEmpty({ message: 'Session type is required.' })
    @IsEnum(SessionType, { message: 'Invalid session type. Must be Morning, Evening, or Full Day.' })
    session: SessionType; // 'Morning', 'Evening', 'Full Day'
}
