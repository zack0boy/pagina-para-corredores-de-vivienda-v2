import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';
import { actorDeRequest } from '../common/types/actor-context';

@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  create(@Body() dto: CreatePagoDto, @Request() req) {
    return this.pagosService.create(dto, actorDeRequest(req));
  }

  @Get()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findAll(@Request() req) {
    return this.pagosService.findAllScoped(actorDeRequest(req));
  }

  @Get('pendientes')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findPendientes() {
    return this.pagosService.findPendientes();
  }

  // Resumen de ventas de un corredor (el propio corredor, o un admin/superadmin consultándolo).
  @Get('resumen/corredor/:corredorId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  resumenCorredor(@Param('corredorId', ParseUUIDPipe) corredorId: string, @Request() req) {
    if (req.user.role === RolUsuario.CORREDOR && req.user.id !== corredorId) {
      throw new ForbiddenException('Un corredor solo puede ver sus propias ventas');
    }
    return this.pagosService.obtenerResumenCorredor(corredorId);
  }

  // Tabla de ventas por corredor DENTRO de una empresa (admin de esa empresa, o superadmin).
  @Get('resumen/empresa/:empresaId')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  resumenEmpresa(@Param('empresaId') empresaId: string, @Request() req) {
    if (req.user.role === RolUsuario.ADMIN_EMPRESA && req.user.empresa_id !== empresaId) {
      throw new ForbiddenException('No tiene acceso a esta empresa');
    }
    return this.pagosService.obtenerResumenEmpresa(empresaId);
  }

  // Todas las empresas, separadas (solo superadmin).
  @Get('resumen/todas-empresas')
  @Roles(RolUsuario.SUPER_ADMIN)
  resumenTodasEmpresas() {
    return this.pagosService.obtenerResumenTodasEmpresas();
  }

  @Get('cuota/:cuotaId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByCuota(@Param('cuotaId', ParseUUIDPipe) cuotaId: string) {
    return this.pagosService.findByCuota(cuotaId);
  }

  @Get('cliente/:clienteId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.pagosService.findByCliente(clienteId);
  }

  @Get('corredor/:corredorId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByCorredor(@Param('corredorId', ParseUUIDPipe) corredorId: string, @Request() req) {
    if (req.user.role === RolUsuario.CORREDOR && req.user.id !== corredorId) {
      throw new ForbiddenException('Un corredor solo puede ver sus propios pagos');
    }
    return this.pagosService.findByCorredor(corredorId);
  }

  @Get(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.pagosService.findOneScoped(id, actorDeRequest(req));
  }

  @Patch(':id/validar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  validar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidarPagoDto) {
    return this.pagosService.validar(id, dto);
  }
}
