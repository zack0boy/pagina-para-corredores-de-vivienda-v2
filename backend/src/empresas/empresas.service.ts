import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  create(createEmpresaDto: CreateEmpresaDto) {
    const empresa = this.empresaRepository.create(createEmpresaDto);

    return this.empresaRepository.save(empresa);
  }

  findAll() {
    return this.empresaRepository.find();
  }

  findOne(id: string) {
    return this.empresaRepository.findOneBy({ id });
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    await this.empresaRepository.update(id, updateEmpresaDto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.empresaRepository.delete(id);

    return {
      message: 'Empresa eliminada',
    };
  }
}