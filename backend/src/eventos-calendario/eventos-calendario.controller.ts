import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { EventosCalendarioService } from './eventos-calendario.service';
import { CreateEventoCalendarioDto } from './dto/create-evento-calendario.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('eventos-calendario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventosCalendarioController {
  constructor(private readonly service: EventosCalendarioService) {}

  @Post()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  create(@Body() dto: CreateEventoCalendarioDto) {
    return this.service.create(dto);
  }

  @Get('corredor/:corredorId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByCorrector(@Param('corredorId', ParseUUIDPipe) corredorId: string) {
    return this.service.findByCorrector(corredorId);
  }

  @Get('corredor/:corredorId/rango')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByCorredorEnRango(
    @Param('corredorId', ParseUUIDPipe) corredorId: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.service.findByCorredorEnRango(corredorId, new Date(desde), new Date(hasta));
  }

  @Get(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/completar')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  marcarCompletado(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.marcarCompletado(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateEventoCalendarioDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
