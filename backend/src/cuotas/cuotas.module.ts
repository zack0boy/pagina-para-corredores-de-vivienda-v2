import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cuota } from './entities/cuota.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { CuotasService } from './cuotas.service';
import { CuotasController } from './cuotas.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cuota, Contrato]),
    NotificacionesModule,
  ],
  controllers: [CuotasController],
  providers: [CuotasService],
  exports: [CuotasService],
})
export class CuotasModule {}
