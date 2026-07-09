import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contrato } from './entities/contrato.entity';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { CuotasModule } from '../cuotas/cuotas.module';
import { PdfModule } from '../pdf/pdf.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Cliente } from '../users/entities/cliente.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, Cliente, Usuario, Empresa, Propiedades]),
    forwardRef(() => CuotasModule),
    PdfModule,
    CloudinaryModule,
    NotificacionesModule,
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
