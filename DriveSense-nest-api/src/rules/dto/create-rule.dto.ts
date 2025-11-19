import { IsInt,ArrayNotEmpty, IsArray, IsString, IsNotEmpty, Matches } from "class-validator";

export class CreateRuleDto {

    @IsString()
    @IsNotEmpty({ message: 'The day of the week is required.' })
    dayOfWeek: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'The time must be in HH:mm format (for example: 06:30)' })
    startTime: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'The time must be in HH:mm format (e.g., 07:30).' })
    endTime: string;

    @IsArray()
    @ArrayNotEmpty({ message: 'It must include at least one restricted digit."' })
    restrictedDigits: string[];

    @IsInt()
    cityId: number; // Relación con City
}

