import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboards.service';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('super-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN)
  async superAdmin() {
    return this.dashboardService.superAdmin();
  }

  @Get('admin-empresa/:empresaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_EMPRESA)
  async adminEmpresa(
    @Param('empresaId') empresaId: string,
  ) {
    return this.dashboardService.adminEmpresa(empresaId);
  }

  @Get('corredor/:corredorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.CORREDOR)
  async corredor(
    @Param('corredorId') corredorId: string,
  ) {
    return this.dashboardService.corredor(corredorId);
  }

  @Get('cliente')
  @UseGuards(JwtAuthGuard)
  async clienteDashboard(@Request() request: any) {
    return this.dashboardService.cliente(request.user.id);
  }
}