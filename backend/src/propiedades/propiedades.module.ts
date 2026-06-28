import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';
import { Propiedades } from './entities/propiedades.entity';
import { PropiedadImagen } from '../propiedad-imagen/entities/propiedad-imagen.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { HistorialPropiedad } from './entities/historial-propiedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propiedades, PropiedadImagen, Usuario, HistorialPropiedad])],
  controllers: [PropiedadesController],
  providers: [PropiedadesService],
})
export class PropiedadesModule {}