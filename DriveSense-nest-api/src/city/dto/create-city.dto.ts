import { MinLength, IsString, IsOptional, IsBoolean} from "class-validator";
import { Transform } from "class-transformer";

export class CreateCityDto {

    @IsString()
    @MinLength(3, { message: 'The name must have at least 3 characters.' })
    @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
