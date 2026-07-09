import { Module } from '@nestjs/common';
import { CuotasCronService } from './cuotas-cron.service';
import { CuotasModule } from '../cuotas/cuotas.module';
import { SolicitudesClienteModule } from '../solicitudes-cliente/solicitudes-cliente.module';

@Module({
  imports: [CuotasModule, SolicitudesClienteModule],
  providers: [CuotasCronService],
})
export class CronModule {}
