import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CuotasService } from '../cuotas/cuotas.service';
import { SolicitudesClienteService } from '../solicitudes-cliente/solicitudes-cliente.service';

@Injectable()
export class CuotasCronService {
  private readonly logger = new Logger(CuotasCronService.name);

  constructor(
    private readonly cuotasService: CuotasService,
    private readonly solicitudesClienteService: SolicitudesClienteService,
  ) {}

  // Corre todos los días a las 06:00. Marca cuotas vencidas, genera notificaciones
  // de cuotas próximas a vencer (1/3/7 días) y expira solicitudes de cliente vencidas.
  @Cron('0 6 * * *')
  async procesarVencimientosDiarios() {
    const vencidas = await this.cuotasService.marcarVencidasPorFecha();
    const notificaciones = await this.cuotasService.crearNotificacionesCuotasProximas();
    const solicitudesExpiradas = await this.solicitudesClienteService.expirarVencidas();
    this.logger.log(
      `Cron diario: ${vencidas} cuotas vencidas, ${notificaciones} notificaciones creadas, ${solicitudesExpiradas} solicitudes expiradas`,
    );
  }
}
