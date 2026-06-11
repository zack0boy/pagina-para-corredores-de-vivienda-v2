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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateClienteDto, UpdateClienteDto, } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto, } from './dto/create-corredor.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';
import { FilterClienteDto } from './dto/filter-cliente.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  //========================
  // PERFIL DEL USUARIO ACTUAL
  //========================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @Request() request: any,
  ) {
    return this.userService.findById(request.user.id);
  }

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
    RolUsuario.CLIENTE,
  )
  async getAllClientes(@Query() filters: FilterClienteDto) {
    if (Object.keys(filters).length === 0 || (Object.keys(filters).length === 2 && filters.page && filters.limit)) {
      return this.userService.getAllClientes();
    }
    return this.userService.findClientesWithFilters(filters);
  }

  @Get('clientes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CLIENTE,
  )
  async getCliente(
    @Param('id') id: string,
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
    @Param('id') id: string,
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
    @Param('id') id: string,
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
    @Param('id') id: string,
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