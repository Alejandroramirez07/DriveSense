import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from '../typeorm.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CityModule } from './city/city.module';
import { RulesModule } from './rules/rules.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CommonModule } from './common/common.module';
import { LogsModule } from './logss/logs.module';
import { LoggingInterceptor } from 'common/interceptors/login.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    CityModule,
    RulesModule,
    VehiclesModule,
    CommonModule,
    LogsModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}