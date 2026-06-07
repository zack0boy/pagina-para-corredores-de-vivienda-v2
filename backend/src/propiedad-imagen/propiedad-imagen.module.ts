import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropiedadImagen } from './entities/propiedad-imagen.entity';
import { PropiedadImagenController } from './propiedad-imagen.controller';
import { PropiedadImagenService } from './propiedad-imagen.service';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropiedadImagen,
    ]),
    CloudinaryModule,
  ],
  controllers: [
    PropiedadImagenController,
  ],
  providers: [
    PropiedadImagenService,
  ],
})
export class PropiedadImagenModule {}