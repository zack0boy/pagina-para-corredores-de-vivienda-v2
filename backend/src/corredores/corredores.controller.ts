import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CorredoresService } from './corredores.service';
import { CreateCorredorDto } from './dto/create-corredor.dto';
import { UpdateCorredorDto } from './dto/update-corredor.dto';

@Controller('corredores')
export class CorredoresController {
  constructor(
    private readonly corredoresService: CorredoresService,
  ) {}

  @Post()
  create(@Body() createCorredorDto: CreateCorredorDto) {
    return this.corredoresService.create(createCorredorDto);
  }

  @Get()
  findAll() {
    return this.corredoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corredoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCorredorDto: UpdateCorredorDto,
  ) {
    return this.corredoresService.update(id, updateCorredorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corredoresService.remove(id);
  }
}
