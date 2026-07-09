import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComprobanteService } from './comprobante.service';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { UpdateComprobanteDto } from './dto/update-comprobante.dto';
import { ValidarComprobanteDto } from './dto/validar-comprobante.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { RolUsuario } from '../common/enum/roles.enum';

@Controller('comprobante')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComprobanteController {
  constructor(
    private readonly comprobanteService: ComprobanteService,
  ) {}

  @Post(':pagoId/upload')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('archivo'))
  upload(
    @Param('pagoId') pagoId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.comprobanteService.uploadComprobante(
      pagoId,
      file,
      observaciones,
    );
  }

  @Post()
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  create(
    @Body()
    createComprobanteDto: CreateComprobanteDto,
  ) {
    return this.comprobanteService.create(
      createComprobanteDto,
    );
  }

  @Get()
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findAll() {
    return this.comprobanteService.findAll();
  }

  @Get('pago/:pagoId')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findByPago(@Param('pagoId') pagoId: string) {
    return this.comprobanteService.findByPago(pagoId);
  }

  @Get(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.comprobanteService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.CORREDOR, RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    updateComprobanteDto: UpdateComprobanteDto,
  ) {
    return this.comprobanteService.update(
      id,
      updateComprobanteDto,
    );
  }

  // Validación de nivel archivo: útil si hay varios comprobantes por pago y se
  // quiere rechazar uno puntual (pidiendo reenvío) sin tocar el pago completo.
  // La validación "autoritativa" a nivel de negocio es PATCH /pagos/:id/validar.
  @Patch(':id/validar')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  validar(
    @Param('id') id: string,
    @Body()
    validarComprobanteDto: ValidarComprobanteDto,
  ) {
    return this.comprobanteService.validarComprobante(
      id,
      validarComprobanteDto,
    );
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN_EMPRESA, RolUsuario.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.comprobanteService.remove(id);
  }
}
