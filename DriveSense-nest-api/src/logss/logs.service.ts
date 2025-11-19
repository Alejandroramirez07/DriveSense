import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Log } from './entities/log.entity';
import { City } from '../city/entities/city.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { FilterLogDto } from './dto/filter-log.dto';

@Injectable()
export class LogsService {

 constructor(
@InjectRepository(Log)
private readonly logRepository: Repository<Log>,

@InjectRepository(City)
private readonly cityRepository: Repository<City>,

@InjectRepository(Vehicle)
 private readonly vehicleRepository: Repository<Vehicle>,
) {}


async create(data: CreateLogDto) {

    // Mantener la verificación y asignación de entidades
    let city: City | null = null; 
    let vehicle: Vehicle | null = null;

    if (data.cityId) {
        city = await this.cityRepository.findOne({ where: { id: data.cityId } });
        if (!city) throw new NotFoundException(`City ${data.cityId} not found`);
    }

    if (data.vehicleId) {
        vehicle = await this.vehicleRepository.findOne({ where: { id: data.vehicleId } });
        if (!vehicle) throw new NotFoundException(`Vehicle ${data.vehicleId} not found`);
    }

    // 1. Separar los IDs del DTO
    const { cityId, vehicleId, ...logData } = data;

    // 2. Definir el objeto base con los datos planos
    const logCreationData: any = {
        ...logData,
    };

    // 3. AÑADIR CONDICIONALMENTE las relaciones solo si existen
    if (city) {
        logCreationData.city = city;
    }
    if (vehicle) {
        logCreationData.vehicle = vehicle;
    }

    // 4. Crear el objeto con la data limpia y condicional
    const log = this.logRepository.create(logCreationData);

    return await this.logRepository.save(log);
}
  async findAll(filters?: FilterLogDto) { // Acepta el argumento opcional
    const whereCondition = {};
    
    // Si necesitas filtrar por usuario:
    if (filters && filters.user) {
        whereCondition['user'] = filters.user;
    }
    
    // Si necesitas filtrar por vehículo:
    if (filters && filters.vehicleId) {
        whereCondition['vehicle'] = { id: filters.vehicleId };
    }

    return this.logRepository.find({
        where: whereCondition, 
        relations: ['city', 'vehicle'],
        order: { createdAt: 'DESC' },
    });
}

}
