import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Lead } from '../lead/entities/lead.entity';
import { Corredor } from '../corredores/entities/corredor.entity';
import { Contrato } from '../contratos/entities/contrato.entity';

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

    @InjectRepository(Corredor)
    private readonly corredorRepository: Repository<Corredor>,

    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
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

  async adminEmpresa(empresaId: string) {
    const [
      corredores,
      propiedades,
      leads,
      contratos,
    ] = await Promise.all([
      this.corredorRepository.count({ where: { empresa_id: empresaId } }),
      this.propiedadRepository.count({ where: { empresa_id: empresaId } }),
      this.leadRepository.count({ where: { empresa_id: empresaId } }),
      this.contratoRepository.count({ where: { empresa_id: empresaId } }),
    ]);

    return {
      corredores,
      propiedades,
      leads,
      contratos,
    };
  }
}