import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboards.controller';
import { DashboardService } from './dashboards.service';

import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Lead } from '../lead/entities/lead.entity';
import { Corredor } from '../corredores/entities/corredor.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Visita } from '../visitas/entities/visita.entity';
import { Cuota } from '../cuotas/entities/cuota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa,
      Usuario,
      Propiedades,
      Lead,
      Corredor,
      Contrato,
      Visita,
      Cuota,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardsModule {}