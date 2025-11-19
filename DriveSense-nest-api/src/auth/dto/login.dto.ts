import { IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDTO {
    @IsEmail()
    @Transform(({ value }) => value?.toLowerCase())
    email: string;

    @Length(8, 32, {message: 'Password must be between 8 and 32 characters'})
    password: string;
}