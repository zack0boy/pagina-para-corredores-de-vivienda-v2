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
    if (!file) {
      throw new Error('No se recibió ningún archivo en el campo "imagen"');
    }

    // Validamos cupo antes de subir a Cloudinary
    const cantidad = await this.imagenRepository.count({
      where: { propiedad_id },
    });

    if (cantidad >= 10) {
      throw new Error('La propiedad ya tiene el máximo de 10 imágenes');
    }

    // Subimos el archivo directamente desde el buffer en memoria
    const resultado = await this.subirBufferACloudinary(file.buffer);

    const imagen = this.imagenRepository.create({
      propiedad_id,
      url: resultado.secure_url,
      public_id: resultado.public_id,
      orden: cantidad + 1,
    });

    return this.imagenRepository.save(imagen);
  }

  // Sube un buffer (imagen en memoria) a Cloudinary usando upload_stream
  private subirBufferACloudinary(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'propiedades' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

  findAll() {
    return this.imagenRepository.find({
      order: {
        orden: 'ASC',
      },
    });
  }

  // Devuelve todas las imágenes de una propiedad específica, ordenadas
  findByPropiedad(propiedad_id: string) {
    return this.imagenRepository.find({
      where: { propiedad_id },
      order: { orden: 'ASC' },
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

    // Solo intentamos borrar de Cloudinary si hay public_id guardado
    if (imagen.public_id) {
      await cloudinary.uploader.destroy(imagen.public_id);
    }

    await this.imagenRepository.delete(id);

    return {
      message: 'Imagen eliminada',
    };
  }
}