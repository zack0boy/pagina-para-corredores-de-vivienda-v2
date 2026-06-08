import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboards.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('super-admin')
  async superAdmin() {
    return this.dashboardService.superAdmin();
  }
}