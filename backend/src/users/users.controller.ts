import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateClienteDto, UpdateClienteDto, } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto, } from './dto/create-corredor.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  //========================
  // CLIENTES
  //========================

  @Post('clientes')
  async createCliente(
    @Body() dto: CreateClienteDto,
  ) {
    return this.userService.createCliente(dto);
  }

  @Get('clientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
  )
  async getAllClientes() {
    return this.userService.getAllClientes();
  }

  @Get('clientes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CLIENTE,
  )
  async getCliente(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any,
  ) {
    if (
      request.user.role === RolUsuario.CLIENTE &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede acceder a los datos de otro cliente',
      );
    }
    return this.userService.getCliente(id);
  }

  @Patch('clientes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CLIENTE,
  )
  async updateCliente(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any,
    @Body() dto: UpdateClienteDto,
  ) {
    if (
      request.user.role === RolUsuario.CLIENTE &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede modificar los datos de otro cliente',
      );
    }
    return this.userService.updateCliente(
      id,
      dto,
    );
  }

  //========================
  // CORREDORES
  //========================

  @Post('corredores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
  )
  async createCorredor(
    @Body() dto: CreateCorredorDto,
  ) {
    return this.userService.createCorredor(
      dto,
    );
  }

  @Get('corredores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
  )
  async getAllCorredores() {
    return this.userService.getAllCorredores();
  }

  @Get('corredores/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CORREDOR,
  )
  async getCorredor(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any,
  ) {
    if (
      request.user.role === RolUsuario.CORREDOR &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede acceder a los datos de otro corredor',
      );
    }
    return this.userService.getCorredor(id);
  }

  @Patch('corredores/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CORREDOR,
  )
  async updateCorredor(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any,
    @Body() dto: UpdateCorredorDto,
  ) {
    if (
      request.user.role === RolUsuario.CORREDOR &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede modificar los datos de otro corredor',
      );
    }
    return this.userService.updateCorredor(
      id,
      dto,
    );
  }
}