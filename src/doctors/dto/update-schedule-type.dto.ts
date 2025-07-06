// src/doctors/dto/update-schedule-type.dto.ts
import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateScheduleTypeDto {
    @IsNotEmpty()
    @IsIn(['stream', 'wave'], { message: 'schedule_Type must be either "stream" or "wave"' })
    schedule_Type: 'stream' | 'wave';
}
