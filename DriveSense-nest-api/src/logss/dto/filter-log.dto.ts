import { IsOptional, IsString, IsInt } from "class-validator";

export class FilterLogDto {

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsOptional()
  startDate?: string; // formato YYYY-MM-DD

  @IsOptional()
  endDate?: string;

  @IsOptional()
  @IsInt()
  vehicleId?: number;
}
