import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudCliente } from './entities/solicitud-cliente.entity';
import { SolicitudesClienteService } from './solicitudes-cliente.service';
import { SolicitudesClienteController } from './solicitudes-cliente.controller';
import { Usuario } from '../users/entities/usuario.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudCliente, Usuario]),
    NotificacionesModule,
  ],
  controllers: [SolicitudesClienteController],
  providers: [SolicitudesClienteService],
  exports: [SolicitudesClienteService],
})
export class SolicitudesClienteModule {}
