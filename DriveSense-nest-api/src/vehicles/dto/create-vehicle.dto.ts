import { IsString, IsNotEmpty, IsNumber, IsIn, Min, Max } from 'class-validator';
import type { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;

  @IsString()
  @IsIn(['car', 'motorcycle'])
  type: VehicleType;
}