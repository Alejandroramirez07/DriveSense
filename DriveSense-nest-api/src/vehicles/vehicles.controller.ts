import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { RolesEnum } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(RolesEnum.USER)
  create(@Body() createVehicleDto: CreateVehicleDto, @Request() req) {
    return this.vehiclesService.create(createVehicleDto, req.user);
  }

  @Get()
  @Roles(RolesEnum.ADMIN)
  findAll(@Request() req) {
    return this.vehiclesService.findAll(req.user);
  }

  @Get(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.vehiclesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(RolesEnum.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVehicleDto: UpdateVehicleDto, @Request() req) {
    return this.vehiclesService.update(id, updateVehicleDto, req.user);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.vehiclesService.remove(id, req.user);
  }
}