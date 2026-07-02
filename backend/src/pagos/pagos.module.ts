import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Propiedades])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
