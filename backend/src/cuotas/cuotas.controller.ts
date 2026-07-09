import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CuotasService } from './cuotas.service';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('cuotas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) {}

  @Post()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  create(@Body() createCuotaDto: CreateCuotaDto) {
    return this.cuotasService.create(createCuotaDto);
  }

  @Get()
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findAll(@Query('estado') estado?: string) {
    if (!estado) {
      return this.cuotasService.findAll();
    }
    return this.cuotasService.findAll();
  }

  @Get('pendientes/listado')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerPendientes() {
    return this.cuotasService.obtenerCuotasPendientes();
  }

  @Get('pendientes/contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerPendientesPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasPendientesPorContrato(contrato_id);
  }

  @Get('pagadas/listado')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerPagadas() {
    return this.cuotasService.obtenerCuotasPagadas();
  }

  @Get('pagadas/contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerPagadasPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasPagadasPorContrato(contrato_id);
  }

  @Get('vencidas/listado')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerVencidas() {
    return this.cuotasService.obtenerCuotasVencidas();
  }

  @Get('vencidas/contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerVencidasPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasVencidasPorContrato(contrato_id);
  }

  @Get('parciales/listado')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerParciales() {
    return this.cuotasService.obtenerCuotasParciales();
  }

  @Get('parciales/contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerParcialesPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasParcialesPorContrato(contrato_id);
  }

  @Get('sin-pagar/listado')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerSinPagar() {
    return this.cuotasService.obtenerCuotasSinPagar();
  }

  @Get('sin-pagar/contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerSinPagarPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasSinPagarPorContrato(contrato_id);
  }

  @Get('resumen/empresa/:empresa_id')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerResumenPorEmpresa(@Param('empresa_id') empresa_id: string) {
    return this.cuotasService.obtenerResumenCuotasPorEmpresa(empresa_id);
  }

  @Get('resumen/corredor/:corredor_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerResumenPorCorredor(@Param('corredor_id') corredor_id: string) {
    return this.cuotasService.obtenerResumenCuotasPorCorredor(corredor_id);
  }

  @Get('corredor/:corredor_id/pendientes')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerPendientesPorCorredor(@Param('corredor_id') corredor_id: string) {
    return this.cuotasService.obtenerCuotasPendientesPorCorredor(corredor_id);
  }

  @Get('contrato/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.findByContrato(contrato_id);
  }

  @Get('reporte/:contrato_id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  obtenerReporte(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerReporteCuotas(contrato_id);
  }

  @Get(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.cuotasService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCuotaDto: UpdateCuotaDto,
  ) {
    return this.cuotasService.update(id, updateCuotaDto);
  }

  @Patch(':id/pago')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  registrarPago(
    @Param('id') id: string,
    @Body() body: { monto: number; fecha_pago: string },
  ) {
    return this.cuotasService.registrarPago(
      id,
      body.monto,
      new Date(body.fecha_pago),
    );
  }

  @Patch(':id/vencida')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  marcarVencida(@Param('id') id: string) {
    return this.cuotasService.marcarVencida(id);
  }

  @Patch(':id/anular')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  anular(@Param('id') id: string) {
    return this.cuotasService.anular(id);
  }

  @Patch('batch/marcar-vencidas')
  @Roles(RolUsuario.SUPER_ADMIN)
  marcarVencidasPorFecha() {
    return this.cuotasService.marcarVencidasPorFecha();
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.cuotasService.remove(id);
  }
}
