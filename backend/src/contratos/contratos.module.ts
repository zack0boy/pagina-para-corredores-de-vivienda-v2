import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { Contrato } from './entities/contrato.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { Corredor } from '../users/entities/corredor.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contrato,
      Cliente,
      Corredor,
      Propiedades,
    ]),
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratosModule {}
