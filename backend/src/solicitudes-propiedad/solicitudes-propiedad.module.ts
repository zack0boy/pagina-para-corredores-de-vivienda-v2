import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudPropiedad } from './entities/solicitud-propiedad.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { SolicitudesPropiedadService } from './solicitudes-propiedad.service';
import { SolicitudesPropiedadController } from './solicitudes-propiedad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudPropiedad, Propiedades, Categoria])],
  controllers: [SolicitudesPropiedadController],
  providers: [SolicitudesPropiedadService],
})
export class SolicitudesPropiedadModule {}
