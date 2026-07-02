import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { EmpresasService } from './empresas.service';

import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @Roles(RolUsuario.SUPER_ADMIN)
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }
}
