import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
  @Roles(RolesEnum.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

 @Put(':id')
@UseGuards(JwtAuthGuard)
update(
  @Req() req,
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateUserDto
) {
  const isAdmin = req.user.role === RolesEnum.ADMIN;
  if (!isAdmin && req.user.id !== id) {
    throw new ForbiddenException('No puedes actualizar otro usuario');
  }
  delete dto.role; // solo admins pueden cambiar rol
  return this.usersService.update(id, dto);
}


  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}