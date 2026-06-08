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

import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  // ====================================
  // POST /contratos
  // Crear un nuevo contrato
  // ====================================
  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  // ====================================
  // GET /contratos
  // Obtener todos los contratos
  // ====================================
  @Get()
  findAll(
    @Query('empresa_id') empresa_id?: string,
    @Query('cliente_id') cliente_id?: string,
    @Query('corredor_id') corredor_id?: string,
  ) {
    if (empresa_id) {
      return this.contratosService.findByEmpresa(empresa_id);
    }
    if (cliente_id) {
      return this.contratosService.findByCliente(cliente_id);
    }
    if (corredor_id) {
      return this.contratosService.findByCorredor(corredor_id);
    }
    return this.contratosService.findAll();
  }

  // ====================================
  // GET /contratos/:id
  // Obtener un contrato por ID
  // ====================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contratosService.findOne(id);
  }

  // ====================================
  // PATCH /contratos/:id
  // Actualizar un contrato
  // ====================================
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContratoDto: UpdateContratoDto,
  ) {
    return this.contratosService.update(id, updateContratoDto);
  }

  // ====================================
  // PATCH /contratos/:id/activar
  // Activar contrato y generar cuotas si es arriendo
  // ====================================
  @Patch(':id/activar')
  activar(@Param('id') id: string) {
    return this.contratosService.activar(id);
  }

  // ====================================
  // PATCH /contratos/:id/finalizar
  // Finalizar un contrato
  // ====================================
  @Patch(':id/finalizar')
  finalizar(@Param('id') id: string) {
    return this.contratosService.finalizar(id);
  }

  // ====================================
  // PATCH /contratos/:id/cancelar
  // Cancelar un contrato
  // ====================================
  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.contratosService.cancelar(id);
  }

  // ====================================
  // DELETE /contratos/:id
  // Eliminar un contrato
  // ====================================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contratosService.remove(id);
  }
}
