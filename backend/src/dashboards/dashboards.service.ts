import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Lead } from '../lead/entities/lead.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,

    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async superAdmin() {
    const [
      empresas,
      usuarios,
      propiedades,
      leads,
    ] = await Promise.all([
      this.empresaRepository.count(),
      this.usuarioRepository.count(),
      this.propiedadRepository.count(),
      this.leadRepository.count(),
    ]);

    return {
      empresas,
      usuarios,
      propiedades,
      leads,
    };
  }
}