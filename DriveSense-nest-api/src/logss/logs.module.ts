import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { City } from '../city/entities/city.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log, City, Vehicle])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService, TypeOrmModule],
})
export class LogsModule {}
