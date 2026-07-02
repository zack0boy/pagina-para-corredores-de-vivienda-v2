import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CorredoresService } from './corredores.service';
import { CreateCorredorDto } from './dto/create-corredor.dto';
import { UpdateCorredorDto } from './dto/update-corredor.dto';
import { AsignaCorredorService } from './asigna-corredor.service';
import { ConvertirClienteACorredorDto } from './dto/convertir-cliente-corredor.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('corredores')
export class CorredoresController {
  constructor(
    private readonly corredoresService: CorredoresService,
    private readonly asignaCorredorService: AsignaCorredorService,
  ) {}

  @Post()
  create(@Body() createCorredorDto: CreateCorredorDto) {
    return this.corredoresService.create(createCorredorDto);
  }

  @Get()
  findAll() {
    return this.corredoresService.findAll();
  }

  @Get('empresas')
  obtenerEmpresas() {
    return this.asignaCorredorService.obtenerEmpresas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corredoresService.findOne(id);
  }

  @Patch('convertir-cliente')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  convertirCliente(
    @Body() dto: ConvertirClienteACorredorDto,
    @Request() request: any,
  ) {
    return this.asignaCorredorService.convertirClienteACorredor(dto, request.user?.id);
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
