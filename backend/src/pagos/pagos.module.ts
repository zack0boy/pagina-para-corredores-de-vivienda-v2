import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { ComprobanteModule } from '../comprobante/comprobante.module';
import { CuotasModule } from '../cuotas/cuotas.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Propiedades, Usuario]),
    ComprobanteModule,
    CuotasModule,
    NotificacionesModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
