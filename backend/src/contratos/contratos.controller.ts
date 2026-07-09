import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';
import { actorDeRequest } from '../common/types/actor-context';

@Controller('contratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  // ====================================
  // POST /contratos
  // Crear un nuevo contrato
  // ====================================
  @Post()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  create(@Body() createContratoDto: CreateContratoDto, @Request() req) {
    return this.contratosService.create(createContratoDto, actorDeRequest(req));
  }

  // ====================================
  // GET /contratos
  // Obtener contratos. SUPER_ADMIN puede filtrar libremente por empresa/cliente;
  // ADMIN_EMPRESA y CORREDOR siempre quedan acotados a lo suyo (no se confía en query params).
  // ====================================
  @Get()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findAll(@Request() req, @Query('empresa_id') empresa_id?: string, @Query('cliente_id') cliente_id?: string) {
    const actor = actorDeRequest(req);
    if (actor.role === RolUsuario.SUPER_ADMIN) {
      if (empresa_id) return this.contratosService.findByEmpresa(empresa_id);
      if (cliente_id) return this.contratosService.findByCliente(cliente_id);
      return this.contratosService.findAll();
    }
    return this.contratosService.findAllScoped(actor);
  }

  // ====================================
  // GET /contratos/:id
  // ====================================
  @Get(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.contratosService.findOneScoped(id, actorDeRequest(req));
  }

  // ====================================
  // PATCH /contratos/:id
  // Actualizar un contrato
  // ====================================
  @Patch(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateContratoDto: UpdateContratoDto,
    @Request() req,
  ) {
    return this.contratosService.update(id, updateContratoDto, actorDeRequest(req));
  }

  // ====================================
  // PATCH /contratos/:id/activar
  // Activar contrato (= validar el contrato firmado subido) y generar cuotas si es arriendo.
  // Solo admin/superadmin: esta acción ES la validación del PDF firmado.
  // ====================================
  @Patch(':id/activar')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  activar(@Param('id') id: string, @Request() req) {
    return this.contratosService.activar(id, actorDeRequest(req));
  }

  // ====================================
  // PATCH /contratos/:id/finalizar
  // ====================================
  @Patch(':id/finalizar')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  finalizar(@Param('id') id: string, @Request() req) {
    return this.contratosService.finalizar(id, actorDeRequest(req));
  }

  // ====================================
  // PATCH /contratos/:id/cancelar
  // ====================================
  @Patch(':id/cancelar')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  cancelar(@Param('id') id: string, @Request() req) {
    return this.contratosService.cancelar(id, actorDeRequest(req));
  }

  // ====================================
  // DELETE /contratos/:id
  // ====================================
  @Delete(':id')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.contratosService.remove(id, actorDeRequest(req));
  }

  // ====================================
  // GET /contratos/:id/pdf
  // Genera y descarga el PDF del contrato (siempre fresco, no se persiste).
  // ====================================
  @Get(':id/pdf')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  async descargarPdf(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const { buffer, contrato } = await this.contratosService.generarPdf(id, actorDeRequest(req));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="contrato-${contrato.numero_contrato}.pdf"`,
    });
    res.send(buffer);
  }

  // ====================================
  // POST /contratos/:id/upload-firmado
  // Sube el PDF firmado por las partes (solo mientras el contrato está en BORRADOR).
  // ====================================
  @Post(':id/upload-firmado')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('archivo'))
  subirFirmado(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.contratosService.subirContratoFirmado(id, file, actorDeRequest(req));
  }
}
