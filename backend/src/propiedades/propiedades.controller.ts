import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { PropiedadesService } from './propiedades.service';

import { CreatePropiedadesDto } from './dto/create-propiedades.dto';
import { UpdatePropiedadesDto } from './dto/update-propiedades.dto';
import { FilterPropiedadesDto } from './dto/filter-propiedades.dto';

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
  findAll(@Query() filters: FilterPropiedadesDto) {
    if (Object.keys(filters).length === 0 || (Object.keys(filters).length === 2 && filters.page && filters.limit)) {
      return this.propiedadesService.findAll();
    }
    return this.propiedadesService.findWithFilters(filters);
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