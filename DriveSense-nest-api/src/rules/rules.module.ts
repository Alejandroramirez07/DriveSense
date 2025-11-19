import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule} from './entities/rule.entity';
import { City } from '../city/entities/city.entity';
import { LogsModule } from '../logss/logs.module';
import { Vehicle } from 'vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rule, City, Vehicle]),
  LogsModule
],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
