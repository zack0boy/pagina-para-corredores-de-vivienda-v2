import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { VisitasService } from './visitas.service';

import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';

@Controller('visitas')
export class VisitasController {
  constructor(
    private readonly visitasService: VisitasService,
  ) {}

  @Post()
  create(
    @Body()
    createVisitaDto: CreateVisitaDto,
  ) {
    return this.visitasService.create(
      createVisitaDto,
    );
  }

  @Get()
  findAll() {
    return this.visitasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.findOne(
      id,
    );
  }

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

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.visitasService.remove(
      id,
    );
  }

@Patch(':id/cancelar')
cancelar(@Param('id') id: string) {
  return this.visitasService.cancelar(id);
}
}
