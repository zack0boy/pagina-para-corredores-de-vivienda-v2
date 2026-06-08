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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComprobanteService } from './comprobante.service';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { UpdateComprobanteDto } from './dto/update-comprobante.dto';
import { ValidarComprobanteDto } from './dto/validar-comprobante.dto';

@Controller('comprobante')
export class ComprobanteController {
  constructor(
    private readonly comprobanteService: ComprobanteService,
  ) {}

  @Post(':pagoId/upload')
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
  create(
    @Body()
    createComprobanteDto: CreateComprobanteDto,
  ) {
    return this.comprobanteService.create(
      createComprobanteDto,
    );
  }

  @Get()
  findAll() {
    return this.comprobanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comprobanteService.findOne(id);
  }

  @Patch(':id')
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

  @Patch(':id/validar')
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
  remove(@Param('id') id: string) {
    return this.comprobanteService.remove(id);
  }
}