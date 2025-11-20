import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CityService {

    constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

 async create(createCityDto: CreateCityDto) {
  const city = this.cityRepository.create(createCityDto);

  try {
    await this.cityRepository.save(city);
    return {
      message: 'City created successfully.',
      data: city,
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(`La ciudad "${createCityDto.name}" ya existe`);
    }
    throw error; // relanza otros errores
  }
}


  async findAll() {
    const cities = await this.cityRepository.find();
    return {
      message: `List of registered cities (${cities.length}).`,
      data: cities,
    };
  }

  async findOne(id: number) {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) throw new NotFoundException(`The city with id ${id} was not found.`);
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.preload({
      id,
      ...updateCityDto,
    });
    if (!city) throw new NotFoundException(`The city with id ${id} was not found.`);

    await this.cityRepository.save(city);
    return {
      message: 'City updated successfully.',
      data: city,
    };
  }

  async remove(id: number) {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
    return { message: 'City deleted successfully.' };
  }

}
  
