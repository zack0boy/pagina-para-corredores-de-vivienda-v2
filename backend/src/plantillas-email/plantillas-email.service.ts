import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlantillaEmail } from './entities/plantilla-email.entity';
import { CreatePlantillaEmailDto } from './dto/create-plantilla-email.dto';
import { UpdatePlantillaEmailDto } from './dto/update-plantilla-email.dto';

@Injectable()
export class PlantillasEmailService {
  constructor(
    @InjectRepository(PlantillaEmail)
    private plantillaRepository: Repository<PlantillaEmail>,
  ) {}

  async create(createPlantillaEmailDto: CreatePlantillaEmailDto): Promise<PlantillaEmail> {
    const plantilla = this.plantillaRepository.create({
      ...createPlantillaEmailDto,
      activa: createPlantillaEmailDto.activa ?? true,
    });

    return await this.plantillaRepository.save(plantilla);
  }

  async findAll(): Promise<PlantillaEmail[]> {
    return await this.plantillaRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findByEmpresa(empresa_id: string): Promise<PlantillaEmail[]> {
    return await this.plantillaRepository.find({
      where: { empresa_id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PlantillaEmail> {
    const plantilla = await this.plantillaRepository.findOneBy({ id });

    if (!plantilla) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    return plantilla;
  }

  async update(
    id: string,
    updatePlantillaEmailDto: UpdatePlantillaEmailDto,
  ): Promise<PlantillaEmail> {
    const plantilla = await this.findOne(id);

    Object.assign(plantilla, updatePlantillaEmailDto);

    return await this.plantillaRepository.save(plantilla);
  }

  async remove(id: string) {
    const plantilla = await this.findOne(id);

    await this.plantillaRepository.remove(plantilla);

    return { message: 'Plantilla eliminada correctamente' };
  }

  async findActivas(empresa_id: string): Promise<PlantillaEmail[]> {
    return await this.plantillaRepository.find({
      where: { empresa_id, activa: true },
      order: { nombre: 'ASC' },
    });
  }
}
