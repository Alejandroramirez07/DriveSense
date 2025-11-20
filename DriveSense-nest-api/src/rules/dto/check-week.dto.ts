import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckWeekDto {
  @IsString()
  @IsNotEmpty()
  plate: string;

  @IsNumber()
  cityId: number;

  
  @IsOptional()
  @IsString()
  date: string; 
}
