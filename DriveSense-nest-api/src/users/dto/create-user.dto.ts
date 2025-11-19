import { Transform } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  name: string;


  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['admin','user'])
  role?: 'admin' | 'user';
}

