// src/entities/common.ts
// This file holds shared types, enums, and transformers.

// Transformer to handle array of strings stored as a single JSON string in the database
export class StringArrayTransformer {
    to(value: string[]): string {
        return JSON.stringify(value);
    }
    from(value: string): string[] {
        // Ensure that null or undefined values are handled gracefully to prevent errors during parsing
        if (value === null || value === undefined || value.trim() === '') {
            return [];
        }
        try {
            const parsed = JSON.parse(value);
            // Ensure the parsed value is an array, if not, return an empty array
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error parsing JSON string for StringArrayTransformer:', e);
            return []; // Return empty array on parsing error
        }
    }
}

// Enum for Session Type
export enum SessionType {
    MORNING = 'Morning',
    EVENING = 'Evening',
    FULL_DAY = 'Full Day',
}
