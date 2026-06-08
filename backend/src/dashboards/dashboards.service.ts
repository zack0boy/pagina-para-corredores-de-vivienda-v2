import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Lead } from '../lead/entities/lead.entity';
import { Corredor } from '../corredores/entities/corredor.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Visita } from '../visitas/entities/visita.entity';
import { Cuota } from '../cuotas/entities/cuota.entity';

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

    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,

    @InjectRepository(Cuota)
    private readonly cuotaRepository: Repository<Cuota>,
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

  async corredor(corredorId: string) {
    const [
      leads,
      visitas,
      contratos,
      cuotas,
    ] = await Promise.all([
      this.leadRepository.count({ where: { corredor_id: corredorId } }),
      this.visitaRepository.count({ where: { corredor_id: corredorId } }),
      this.contratoRepository.count({ where: { corredor_id: corredorId } }),
      this.cuotaRepository
        .createQueryBuilder('cuota')
        .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
        .where('contrato.corredor_id = :corredorId', { corredorId })
        .getCount(),
    ]);

    return {
      leads,
      visitas,
      contratos,
      cuotas,
    };
  }
}
