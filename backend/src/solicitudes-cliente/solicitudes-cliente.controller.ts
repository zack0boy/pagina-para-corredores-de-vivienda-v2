import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { SolicitudesClienteService } from './solicitudes-cliente.service';
import { CreateSolicitudClienteDto } from './dto/create-solicitud-cliente.dto';
import { ResolverSolicitudDto } from './dto/resolver-solicitud.dto';

@Controller('solicitudes-cliente')
export class SolicitudesClienteController {
  constructor(private readonly service: SolicitudesClienteService) {}

  @Post()
  create(@Body() dto: CreateSolicitudClienteDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('empresa/:empresaId/pendientes')
  findPendientes(@Param('empresaId', ParseUUIDPipe) empresaId: string) {
    return this.service.findPendientesByEmpresa(empresaId);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.service.findByCliente(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/resolver')
  resolver(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolverSolicitudDto) {
    return this.service.resolver(id, dto);
  }

  @Post('expirar-vencidas')
  expirarVencidas() {
    return this.service.expirarVencidas();
  }
}
