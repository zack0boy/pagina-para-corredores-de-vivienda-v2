import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
}