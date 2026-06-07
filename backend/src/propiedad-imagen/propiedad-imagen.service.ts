import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { v2 as cloudinary } from 'cloudinary';

import { PropiedadImagen } from './entities/propiedad-imagen.entity';
import {Multer} from "multer";

@Injectable()
export class PropiedadImagenService {
  constructor(
    @InjectRepository(PropiedadImagen)
    private imagenRepository: Repository<PropiedadImagen>,
  ) {}

  async uploadImage(
    propiedad_id: string,
    file: Express.Multer.File,
  ) {
    const resultado = await cloudinary.uploader.upload(
      file.path,
      {
        folder: 'propiedades',
      },
    );

    const cantidad = await this.imagenRepository.count({
      where: {
        propiedad_id,
      },
    });

    if (cantidad >= 10) {
      throw new Error(
        'La propiedad ya tiene el máximo de 10 imágenes',
      );
    }

    const imagen = this.imagenRepository.create({
      propiedad_id,
      url: resultado.secure_url,
      public_id: resultado.public_id,
      orden: cantidad + 1,
    });

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

  async updateOrden(
    id: string,
    orden: number,
  ) {
    await this.imagenRepository.update(
      id,
      { orden },
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    const imagen =
      await this.imagenRepository.findOneBy({
        id,
      });

    if (!imagen) {
      throw new NotFoundException(
        'Imagen no encontrada',
      );
    }

    await cloudinary.uploader.destroy(
      imagen.public_id,
    );

    await this.imagenRepository.delete(id);

    return {
      message: 'Imagen eliminada',
    };
  }
}