import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesEnum } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';



// TODO: cuando auth esté listo, usar guards y roles, por ejemplo @UseGuards(AuthGuard, RolesGuard)
// y proteger las rutas para que solo admin pueda listar/eliminar.

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}


 


  @Get()
  @Roles(RolesEnum.ADMIN)
  findAll(@Query('limit') limit = '10', @Query('page') page = '1') {
    return this.usersService.findAll(parseInt(limit, 10), parseInt(page, 10));
  }

  @Get(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}