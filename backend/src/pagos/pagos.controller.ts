import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { ValidarPagoDto } from './dto/validar-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get('pendientes')
  findPendientes() {
    return this.pagosService.findPendientes();
  }

  @Get('cuota/:cuotaId')
  findByCuota(@Param('cuotaId', ParseUUIDPipe) cuotaId: string) {
    return this.pagosService.findByCuota(cuotaId);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.pagosService.findByCliente(clienteId);
  }

  @Get('corredor/:corredorId')
  findByCorredor(@Param('corredorId', ParseUUIDPipe) corredorId: string) {
    return this.pagosService.findByCorredor(corredorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findOne(id);
  }

  @Patch(':id/validar')
  validar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidarPagoDto) {
    return this.pagosService.validar(id, dto);
  }
}
