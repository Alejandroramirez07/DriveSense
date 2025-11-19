import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CheckRuleDto {
  @IsString()
  licensePlate: string;

  @IsNumber()
  cityId: number;

  @IsDateString()
  date: string; // formato ISO: 2025-11-12T14:00:00
}
