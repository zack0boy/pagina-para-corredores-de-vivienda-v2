import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateClienteDto, UpdateClienteDto, BloquearClienteDto, } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto, } from './dto/create-corredor.dto';
import { PromoverAdminDto } from './dto/promover-admin.dto';
import { UpdateMeDto } from './dto/update-me.dto';
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
    return this.userService.getCurrentUserProfile(request.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUser(
    @Request() request: any,
    @Body() dto: UpdateMeDto,
  ) {
    const userId = request.user.id;
    return this.userService.updateCurrentUser(userId, dto as any);
  }

  //========================
  // ADMINS / SUPER ADMINS
  //========================

  // Ambos roles pueden ver la lista de admins (admin de empresa: solo lectura)
  @Get('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN, RolUsuario.ADMIN_EMPRESA)
  async getAdmins() {
    return this.userService.getUsuariosPorRol(RolUsuario.ADMIN_EMPRESA);
  }

  // Solo el super admin puede ver la lista de super admins
  @Get('super-admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN)
  async getSuperAdmins() {
    return this.userService.getUsuariosPorRol(RolUsuario.SUPER_ADMIN);
  }

  @Patch('admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN)
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.userService.updateAdmin(id, dto as any);
  }

  @Patch('admins/:id/promover-super')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN)
  async promoverSuperAdmin(@Param('id') id: string) {
    return this.userService.promoverASuperAdmin(id);
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
    RolUsuario.CORREDOR,
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
    return this.userService.findClienteById(id);
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

  @Patch('clientes/:id/bloqueo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
  )
  async bloquearCliente(
    @Param('id') id: string,
    @Body() dto: BloquearClienteDto,
  ) {
    return this.userService.setClienteBloqueo(id, dto.activo);
  }

  @Delete('clientes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CLIENTE,
  )
  async removeCliente(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    if (
      request.user.role === RolUsuario.CLIENTE &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede eliminar a otro cliente',
      );
    }
    return this.userService.removeCliente(id);
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

  @Patch('corredores/:id/promover-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.SUPER_ADMIN)
  async promoverAdmin(
    @Param('id') id: string,
    @Body() dto: PromoverAdminDto,
  ) {
    return this.userService.promoverCorredorAAdmin(id, dto.empresa_id);
  }

  @Delete('corredores/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.SUPER_ADMIN,
    RolUsuario.ADMIN_EMPRESA,
    RolUsuario.CORREDOR,
  )
  async removeCorredor(
    @Param('id') id: string,
    @Request() request: any,
  ) {
    if (
      request.user.role === RolUsuario.CORREDOR &&
      request.user.id !== id
    ) {
      throw new ForbiddenException(
        'No puede eliminar a otro corredor',
      );
    }
    return this.userService.removeCorredor(id);
  }
}