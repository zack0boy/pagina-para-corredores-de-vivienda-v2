import { Controller, Get, Patch, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  obtenerNotificaciones(@Request() req) {
    return this.notificacionesService.obtenerPorUsuario(req.user.id);
  }

  @Get('no-leidas')
  obtenerNoLeidas(@Request() req) {
    return this.notificacionesService.obtenerNoLeidas(req.user.id);
  }

  @Patch(':id/leer')
  marcarComoLeida(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.notificacionesService.marcarComoLeidaDeUsuario(id, req.user.id);
  }
}
