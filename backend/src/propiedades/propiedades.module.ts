import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';
import { Propiedades } from './entities/propiedades.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propiedades])],
  controllers: [PropiedadesController],
  providers: [PropiedadesService],
})
export class PropiedadesModule {}