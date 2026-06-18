import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { EventosCalendarioService } from './eventos-calendario.service';
import { CreateEventoCalendarioDto } from './dto/create-evento-calendario.dto';

@Controller('eventos-calendario')
export class EventosCalendarioController {
  constructor(private readonly service: EventosCalendarioService) {}

  @Post()
  create(@Body() dto: CreateEventoCalendarioDto) {
    return this.service.create(dto);
  }

  @Get('corredor/:corredorId')
  findByCorrector(@Param('corredorId', ParseUUIDPipe) corredorId: string) {
    return this.service.findByCorrector(corredorId);
  }

  @Get('corredor/:corredorId/rango')
  findByCorredorEnRango(
    @Param('corredorId', ParseUUIDPipe) corredorId: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.service.findByCorredorEnRango(corredorId, new Date(desde), new Date(hasta));
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/completar')
  marcarCompletado(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.marcarCompletado(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateEventoCalendarioDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
