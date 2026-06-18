import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudCliente } from './entities/solicitud-cliente.entity';
import { SolicitudesClienteService } from './solicitudes-cliente.service';
import { SolicitudesClienteController } from './solicitudes-cliente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudCliente])],
  controllers: [SolicitudesClienteController],
  providers: [SolicitudesClienteService],
  exports: [SolicitudesClienteService],
})
export class SolicitudesClienteModule {}
