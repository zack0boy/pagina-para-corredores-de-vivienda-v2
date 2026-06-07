import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { PropiedadesService } from './propiedades.service';

import { CreatePropiedadesDto } from './dto/create-propiedades.dto';
import { UpdatePropiedadesDto } from './dto/update-propiedades.dto';

//POST   /propiedades
//GET    /propiedades
//GET    /propiedades/:id
//PATCH  /propiedades/:id
//DELETE /propiedades/:id

@Controller('propiedades')
export class PropiedadesController {
  constructor(
    private readonly propiedadesService: PropiedadesService,
  ) {}

  @Post()
  create(
    @Body() createPropiedadesDto: CreatePropiedadesDto,
  ) {
    return this.propiedadesService.create(
      createPropiedadesDto,
    );
  }

  @Get()
  findAll() {
    return this.propiedadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propiedadesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropiedadesDto: UpdatePropiedadesDto,
  ) {
    return this.propiedadesService.update(
      id,
      updatePropiedadesDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propiedadesService.remove(id);
  }
}