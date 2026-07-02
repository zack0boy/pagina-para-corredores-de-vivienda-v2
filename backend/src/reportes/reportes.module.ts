import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

import { Pago } from '../pagos/entities/pago.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Empresa, Usuario, Cliente, Propiedades]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
