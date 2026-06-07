import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto } from './dto/create-corredor.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/estado.enum';
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // ========== CLIENTES ==========
  @Post('clientes')
  async createCliente(@Body() dto: CreateClienteDto) {
    return this.userService.createCliente(dto);
  }

  @Get('clientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  async getAllClientes() {
    return this.userService.getAllClientes();
  }

  @Get('clientes/:id')
  @UseGuards(JwtAuthGuard)
  async getCliente(@Param('id') id: number) {
    return this.userService.getCliente(id);
  }

  @Patch('clientes/:id')
  @UseGuards(JwtAuthGuard)
  async updateCliente(@Param('id') id: number, @Body() dto: UpdateClienteDto) {
    return this.userService.updateCliente(id, dto);
  }

  // ========== CORREDORES ==========
  @Post('corredores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  async createCorredor(@Body() dto: CreateCorredorDto) {
    return this.userService.createCorredor(dto);
  }

  @Get('corredores')
  async getAllCorredores() {
    return this.userService.getAllCorredores();
  }

  @Get('corredores/:id')
  @UseGuards(JwtAuthGuard)
  async getCorredor(@Param('id') id: number) {
    return this.userService.getCorredor(id);
  }

  @Patch('corredores/:id')
  @UseGuards(JwtAuthGuard)
  async updateCorredor(@Param('id') id: number, @Body() dto: UpdateCorredorDto) {
    return this.userService.updateCorredor(id, dto);
  }
}
