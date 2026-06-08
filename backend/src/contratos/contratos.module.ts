import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contrato } from './entities/contrato.entity';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { CuotasModule } from '../cuotas/cuotas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato]),
    CuotasModule,
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
