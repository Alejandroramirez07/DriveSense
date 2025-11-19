import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesEnum } from 'src/users/entities/user.entity';

@Controller('city')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @Roles(RolesEnum.ADMIN)
  create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Get()
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RolesEnum.ADMIN)
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(+id, updateCityDto);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.cityService.remove(+id );
  }
}

