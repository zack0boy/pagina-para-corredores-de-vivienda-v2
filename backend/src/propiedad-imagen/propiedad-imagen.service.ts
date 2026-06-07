import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PropiedadImagen } from './entities/propiedad-imagen.entity';

import { CreatePropiedadImagenDto } from './dto/create-propiedad-imagen.dto';
import { UpdatePropiedadImagenDto } from './dto/update-propiedad-imagen.dto';

@Injectable()
export class PropiedadImagenService {
  constructor(
    @InjectRepository(PropiedadImagen)
    private imagenRepository: Repository<PropiedadImagen>,
  ) {}

  create(
    createPropiedadImagenDto: CreatePropiedadImagenDto,
  ) {
    const imagen = this.imagenRepository.create(
      createPropiedadImagenDto,
    );

    return this.imagenRepository.save(imagen);
  }

  findAll() {
    return this.imagenRepository.find({
      order: {
        orden: 'ASC',
      },
    });
  }

  findOne(id: string) {
    return this.imagenRepository.findOneBy({
      id,
    });
  }

  async update(
    id: string,
    updatePropiedadImagenDto: UpdatePropiedadImagenDto,
  ) {
    await this.imagenRepository.update(
      id,
      updatePropiedadImagenDto,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.imagenRepository.delete(id);

    return {
      message: 'Imagen eliminada',
    };
  }
}