import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Propiedades } from './entities/propiedades.entity';

import { CreatePropiedadesDto } from './dto/create-propiedades.dto';
import { UpdatePropiedadesDto } from './dto/update-propiedades.dto';
import { FilterPropiedadesDto } from './dto/filter-propiedades.dto';

@Injectable()
export class PropiedadesService {
  constructor(
    @InjectRepository(Propiedades)
    private propiedadRepository: Repository<Propiedades>,
  ) {}

  create(createPropiedadesDto: CreatePropiedadesDto) {
    const propiedad =
      this.propiedadRepository.create(createPropiedadesDto);

    return this.propiedadRepository.save(propiedad);
  }

  findAll() {
    return this.propiedadRepository.find();
  }

  async findWithFilters(filters: FilterPropiedadesDto) {
    const query = this.propiedadRepository.createQueryBuilder('propiedad');

    if (filters.categoriaId) {
      query.andWhere('propiedad.categoria_id = :categoriaId', { categoriaId: filters.categoriaId });
    }

    if (filters.corredorId) {
      query.andWhere('propiedad.corredor_id = :corredorId', { corredorId: filters.corredorId });
    }

    if (filters.tipoOperacion) {
      query.andWhere('propiedad.tipo_operacion = :tipoOperacion', { tipoOperacion: filters.tipoOperacion });
    }

    if (filters.estado) {
      query.andWhere('propiedad.estado = :estado', { estado: filters.estado });
    }

    if (filters.precioMin) {
      query.andWhere('propiedad.precio >= :precioMin', { precioMin: filters.precioMin });
    }

    if (filters.precioMax) {
      query.andWhere('propiedad.precio <= :precioMax', { precioMax: filters.precioMax });
    }

    if (filters.habitaciones) {
      query.andWhere('propiedad.dormitorios = :habitaciones', { habitaciones: filters.habitaciones });
    }

    if (filters.banos) {
      query.andWhere('propiedad.banos = :banos', { banos: filters.banos });
    }

    if (filters.estacionamientos) {
      query.andWhere('propiedad.estacionamientos = :estacionamientos', { estacionamientos: filters.estacionamientos });
    }

    if (filters.nombre) {
      query.andWhere('propiedad.titulo ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    if (filters.empresaId) {
      query.andWhere('propiedad.empresa_id = :empresaId', { empresaId: filters.empresaId });
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    query.skip(skip).take(filters.limit || 10);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  findOne(id: string) {
    return this.propiedadRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updatePropiedadesDto: UpdatePropiedadesDto,
  ) {
    await this.propiedadRepository.update(
      id,
      updatePropiedadesDto,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.propiedadRepository.delete(id);

    return {
      message: 'Propiedad eliminada',
    };
  }
}