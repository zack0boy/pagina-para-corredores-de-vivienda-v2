import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Corredor } from './entities/corredor.entity';
import { CreateCorredorDto } from './dto/create-corredor.dto';
import { UpdateCorredorDto } from './dto/update-corredor.dto';

@Injectable()
export class CorredoresService {
  private roundRobinIndex: Map<string, number> = new Map();

  constructor(
    @InjectRepository(Corredor)
    private corredorRepository: Repository<Corredor>,
  ) {}

  async create(createCorredorDto: CreateCorredorDto) {
    const corredor = this.corredorRepository.create(createCorredorDto);
    return await this.corredorRepository.save(corredor);
  }

  async findAll() {
    return await this.corredorRepository.find();
  }

  async findOne(id: string) {
    return await this.corredorRepository.findOneBy({ id });
  }

  async update(id: string, updateCorredorDto: UpdateCorredorDto) {
    await this.corredorRepository.update(id, updateCorredorDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.corredorRepository.delete(id);
    return {
      message: 'Corredor eliminado',
    };
  }

  /**
   * ALGORITMO ROUND ROBIN
   * Obtiene el siguiente corredor activo de forma cíclica
   * Ej: [Corredor1, Corredor2, Corredor3] → Corredor1 → Corredor2 → Corredor3 → Corredor1...
   */
  async getNextCorredorRoundRobin(empresa_id: string) {
    // Buscar todos los corredores activos de la empresa
    const corredores = await this.corredorRepository.find({
      where: {
        empresa_id,
        activo: true,
      },
      order: {
        created_at: 'ASC',
      },
    });

    if (corredores.length === 0) {
      return null;
    }

    // Obtener el índice actual para esta empresa (o 0 si no existe)
    const currentIndex = this.roundRobinIndex.get(empresa_id) ?? 0;

    // Obtener el corredor en el índice actual
    const proximoCorredor = corredores[currentIndex];

    // Calcular el siguiente índice (con wrap-around)
    const nextIndex = (currentIndex + 1) % corredores.length;
    this.roundRobinIndex.set(empresa_id, nextIndex);

    return proximoCorredor;
  }
}
