import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async create(dto: CreateUserDto) {
   
    const existingUser = await this.usersRepo.findOneBy({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepo.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepo.save(newUser);

    return this.sanitizeUser(savedUser);
  }

  async findOneRaw(id: number) {
    const u = await this.usersRepo.findOneBy({ id });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async findOne(id: number) {
    const u = await this.findOneRaw(id);
    return this.sanitizeUser(u);
  }

  async findAll(limit = 10, page = 1) {
    const users = await this.usersRepo.find({
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'ASC' },
    });

    return users.map(u => this.sanitizeUser(u));
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOneRaw(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);

    return this.sanitizeUser(saved);
  }

  async remove(id: number) {
    const user = await this.findOneRaw(id); 

    await this.usersRepo.remove(user);

    return {
      message: 'User deleted successfully',
      user: this.sanitizeUser(user),
    };
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOneBy({ email });
  }
}