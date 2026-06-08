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

import { VisitasService } from './visitas.service';

import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';

@Controller('visitas')
export class VisitasController {
  constructor(
    private readonly visitasService: VisitasService,
  ) {}

  // ====================================
  // POST /visitas
  // Crear una nueva visita
  // ====================================
  @Post()
  create(
    @Body()
    createVisitaDto: CreateVisitaDto,
  ) {
    return this.visitasService.create(
      createVisitaDto,
    );
  }

  // ====================================
  // GET /visitas
  // Obtener todas las visitas
  // ====================================
  @Get()
  findAll(
    @Query('corredor_id') corredor_id?: string,
    @Query('empresa_id') empresa_id?: string,
  ) {
    if (corredor_id) {
      return this.visitasService.obtenerVisitasPorCorredor(
        corredor_id,
      );
    }
    if (empresa_id) {
      return this.visitasService.obtenerVisitasPorEmpresa(
        empresa_id,
      );
    }
    return this.visitasService.findAll();
  }

  // ====================================
  // GET /visitas/:id
  // Obtener una visita por ID
  // ====================================
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.findOne(
      id,
    );
  }

  // ====================================
  // PATCH /visitas/:id
  // Actualizar una visita
  // ====================================
  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    updateVisitaDto: UpdateVisitaDto,
  ) {
    return this.visitasService.update(
      id,
      updateVisitaDto,
    );
  }

  // ====================================
  // PATCH /visitas/:id/cancelar
  // Cancelar una visita
  // ====================================
  @Patch(':id/cancelar')
  cancelar(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.cancelar(id);
  }

  // ====================================
  // PATCH /visitas/:id/confirmar
  // Confirmar una visita
  // ====================================
  @Patch(':id/confirmar')
  confirmar(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.confirmar(id);
  }

  // ====================================
  // PATCH /visitas/:id/realizada
  // Marcar visita como realizada
  // ====================================
  @Patch(':id/realizada')
  marcarRealizada(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.marcarRealizada(id);
  }

  // ====================================
  // PATCH /visitas/:id/no-asistio
  // Marcar visita como no asistida
  // ====================================
  @Patch(':id/no-asistio')
  marcarNoAsistio(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.marcarNoAsistio(id);
  }

  // ====================================
  // PATCH /visitas/:id/sincronizar
  // Sincronizar visita con Google Calendar
  // ====================================
  @Patch(':id/sincronizar')
  sincronizar(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.sincronizarVisita(id);
  }

  // ====================================
  // DELETE /visitas/:id
  // Eliminar una visita
  // ====================================
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.remove(
      id,
    );
  }
}
