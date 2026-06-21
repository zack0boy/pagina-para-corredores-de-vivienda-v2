import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';
import { Propiedades } from './entities/propiedades.entity';
import { PropiedadImagen } from '../propiedad-imagen/entities/propiedad-imagen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propiedades, PropiedadImagen])],
  controllers: [PropiedadesController],
  providers: [PropiedadesService],
})
export class PropiedadesModule {}