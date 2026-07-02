import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  resumen(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.resumen(desde, hasta);
  }

  @Get('pagos')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  pagos(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.pagosDetalle(desde, hasta);
  }

  @Get('propiedades')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  propiedades() {
    return this.reportesService.propiedadesPorEstado();
  }

  @Get('usuarios')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  usuarios() {
    return this.reportesService.usuariosPorRol();
  }

  @Get('empresas')
  @Roles(RolUsuario.SUPER_ADMIN)
  empresas() {
    return this.reportesService.empresasResumen();
  }

  @Get('pagos/export')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  async exportarPagos(
    @Res() res: Response,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const csv = await this.reportesService.exportarPagosCsv(desde, hasta);
    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-pagos-${fecha}.csv"`,
    );
    res.send(csv);
  }
}
