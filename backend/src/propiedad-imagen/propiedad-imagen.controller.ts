import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { PropiedadImagenService } from './propiedad-imagen.service';

import { CreatePropiedadImagenDto } from './dto/create-propiedad-imagen.dto';
import { UpdatePropiedadImagenDto } from './dto/update-propiedad-imagen.dto';

@Controller('propiedad-imagen')
export class PropiedadImagenController {
  constructor(
    private readonly propiedadImagenService: PropiedadImagenService,
  ) {}

  @Post()
  create(
    @Body()
    createPropiedadImagenDto: CreatePropiedadImagenDto,
  ) {
    return this.propiedadImagenService.create(
      createPropiedadImagenDto,
    );
  }

  @Get()
  findAll() {
    return this.propiedadImagenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadImagenService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePropiedadImagenDto: UpdatePropiedadImagenDto,
  ) {
    return this.propiedadImagenService.update(
      id,
      updatePropiedadImagenDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propiedadImagenService.remove(id);
  }
}