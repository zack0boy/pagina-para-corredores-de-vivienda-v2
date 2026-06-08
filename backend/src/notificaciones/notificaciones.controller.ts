import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  obtenerNotificaciones(@Query('usuario_id') usuario_id: string) {
    return this.notificacionesService.obtenerPorUsuario(usuario_id);
  }

  @Get('no-leidas')
  obtenerNoLeidas(@Query('usuario_id') usuario_id: string) {
    return this.notificacionesService.obtenerNoLeidas(usuario_id);
  }

  @Patch(':id/leer')
  marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id);
  }
}
