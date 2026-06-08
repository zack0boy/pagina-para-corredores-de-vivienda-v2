import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { CuotasService } from './cuotas.service';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';

@Controller('cuotas')
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) {}

  @Post()
  create(@Body() createCuotaDto: CreateCuotaDto) {
    return this.cuotasService.create(createCuotaDto);
  }

  @Get()
  findAll(@Query('estado') estado?: string) {
    if (!estado) {
      return this.cuotasService.findAll();
    }
    return this.cuotasService.findAll();
  }

  @Get('pendientes/listado')
  obtenerPendientes() {
    return this.cuotasService.obtenerCuotasPendientes();
  }

  @Get('pendientes/contrato/:contrato_id')
  obtenerPendientesPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasPendientesPorContrato(contrato_id);
  }

  @Get('pagadas/listado')
  obtenerPagadas() {
    return this.cuotasService.obtenerCuotasPagadas();
  }

  @Get('pagadas/contrato/:contrato_id')
  obtenerPagadasPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasPagadasPorContrato(contrato_id);
  }

  @Get('vencidas/listado')
  obtenerVencidas() {
    return this.cuotasService.obtenerCuotasVencidas();
  }

  @Get('vencidas/contrato/:contrato_id')
  obtenerVencidasPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasVencidasPorContrato(contrato_id);
  }

  @Get('parciales/listado')
  obtenerParciales() {
    return this.cuotasService.obtenerCuotasParciales();
  }

  @Get('parciales/contrato/:contrato_id')
  obtenerParcialesPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasParcialesPorContrato(contrato_id);
  }

  @Get('sin-pagar/listado')
  obtenerSinPagar() {
    return this.cuotasService.obtenerCuotasSinPagar();
  }

  @Get('sin-pagar/contrato/:contrato_id')
  obtenerSinPagarPorContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerCuotasSinPagarPorContrato(contrato_id);
  }

  @Get('resumen/empresa/:empresa_id')
  obtenerResumenPorEmpresa(@Param('empresa_id') empresa_id: string) {
    return this.cuotasService.obtenerResumenCuotasPorEmpresa(empresa_id);
  }

  @Get('contrato/:contrato_id')
  findByContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.findByContrato(contrato_id);
  }

  @Get('reporte/:contrato_id')
  obtenerReporte(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerReporteCuotas(contrato_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuotasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCuotaDto: UpdateCuotaDto,
  ) {
    return this.cuotasService.update(id, updateCuotaDto);
  }

  @Patch(':id/pago')
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
  marcarVencida(@Param('id') id: string) {
    return this.cuotasService.marcarVencida(id);
  }

  @Patch(':id/anular')
  anular(@Param('id') id: string) {
    return this.cuotasService.anular(id);
  }

  @Patch('batch/marcar-vencidas')
  marcarVencidasPorFecha() {
    return this.cuotasService.marcarVencidasPorFecha();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuotasService.remove(id);
  }
}

