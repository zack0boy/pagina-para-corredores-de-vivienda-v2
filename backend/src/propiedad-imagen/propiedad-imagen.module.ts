import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropiedadImagen } from './entities/propiedad-imagen.entity';

import { PropiedadImagenController } from './propiedad-imagen.controller';
import { PropiedadImagenService } from './propiedad-imagen.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropiedadImagen,
    ]),
  ],
  controllers: [
    PropiedadImagenController,
  ],
  providers: [
    PropiedadImagenService,
  ],
})
export class PropiedadImagenModule {}