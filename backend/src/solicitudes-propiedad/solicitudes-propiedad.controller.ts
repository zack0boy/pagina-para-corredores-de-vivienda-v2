import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { SolicitudesPropiedadService } from './solicitudes-propiedad.service';
import {
  CreateSolicitudPropiedadDto,
  ResolverSolicitudPropiedadDto,
} from './dto/create-solicitud-propiedad.dto';

@Controller('solicitudes-propiedad')
export class SolicitudesPropiedadController {
  constructor(private readonly service: SolicitudesPropiedadService) {}

  // Público: cualquiera puede solicitar publicar
  @Post()
  create(@Body() dto: CreateSolicitudPropiedadDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('pendientes')
  findPendientes() {
    return this.service.findPendientes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/resolver')
  resolver(@Param('id') id: string, @Body() dto: ResolverSolicitudPropiedadDto) {
    return this.service.resolver(id, dto);
  }
}
