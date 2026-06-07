import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Propiedades } from './entities/propiedades.entity';

import { CreatePropiedadesDto } from './dto/create-propiedades.dto';
import { UpdatePropiedadesDto } from './dto/update-propiedades.dto';

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