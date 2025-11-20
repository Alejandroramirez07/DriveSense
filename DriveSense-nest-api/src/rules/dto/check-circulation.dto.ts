import { IsString, IsNumber, IsNotEmpty, Matches } from 'class-validator';

export class CheckCirculationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]{3}[0-9]{3}$/, {
    message: 'La placa debe tener 3 letras seguidas de 3 números',
  })
  plate: string;

  @IsNumber()
  cityId: number;

  @IsString()
  @IsNotEmpty()
  date: string; // se valida como string normal (yyyy-mm-dd)
}