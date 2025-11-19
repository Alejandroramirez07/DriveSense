import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>
  ) {}

  async create(data: CreateVehicleDto, user: User) {

    const existingVehicle =await this.vehicleRepo.findOne({
      where: { licensePlate: data.licensePlate}
    });

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this license plate already exists');
    }

    const vehicle = this.vehicleRepo.create({ ...data, user });
    return await this.vehicleRepo.save(vehicle);
  }

  async findAll(user: User) {
    return await this.vehicleRepo.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: number, user: User) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id, user: { id: user.id } } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: number, data: UpdateVehicleDto, user: User) {
    const vehicle = await this.findOne(id, user);
    Object.assign(vehicle, data);
    return await this.vehicleRepo.save(vehicle);
  }

  async remove(id: number, user: User) {
    const vehicle = await this.findOne(id, user);
    return await this.vehicleRepo.remove(vehicle);
  }
}
