import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlantillasEmailService } from './plantillas-email.service';
import { CreatePlantillaEmailDto } from './dto/create-plantilla-email.dto';
import { UpdatePlantillaEmailDto } from './dto/update-plantilla-email.dto';

@Controller('plantillas-email')
export class PlantillasEmailController {
  constructor(private readonly plantillasEmailService: PlantillasEmailService) {}

  @Post()
  create(@Body() createPlantillaEmailDto: CreatePlantillaEmailDto) {
    return this.plantillasEmailService.create(createPlantillaEmailDto);
  }

  @Get()
  findAll(@Query('empresa_id') empresa_id?: string) {
    if (empresa_id) {
      return this.plantillasEmailService.findByEmpresa(empresa_id);
    }
    return this.plantillasEmailService.findAll();
  }

  @Get('activas')
  findActivas(@Query('empresa_id') empresa_id: string) {
    return this.plantillasEmailService.findActivas(empresa_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantillasEmailService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlantillaEmailDto: UpdatePlantillaEmailDto,
  ) {
    return this.plantillasEmailService.update(id, updatePlantillaEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantillasEmailService.remove(id);
  }
}
