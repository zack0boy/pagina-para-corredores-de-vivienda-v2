import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { PropiedadImagenService } from './propiedad-imagen.service';

import {Multer} from "multer";

@Controller('propiedad-imagen')
export class PropiedadImagenController {
  constructor(
    private readonly propiedadImagenService: PropiedadImagenService,
  ) {}

  @Post(':propiedad_id')
  @UseInterceptors(
    FileInterceptor('imagen'),
  )
  upload(
    @Param('propiedad_id')
    propiedad_id: string,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.propiedadImagenService.uploadImage(
      propiedad_id,
      file,
    );
  }

  @Get()
  findAll() {
    return this.propiedadImagenService.findAll();
  }

  // Imágenes de una propiedad específica
  @Get('propiedad/:propiedad_id')
  findByPropiedad(
    @Param('propiedad_id')
    propiedad_id: string,
  ) {
    return this.propiedadImagenService.findByPropiedad(propiedad_id);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.propiedadImagenService.findOne(id);
  }

  @Patch(':id/orden')
  updateOrden(
    @Param('id')
    id: string,

    @Body('orden')
    orden: number,
  ) {
    return this.propiedadImagenService.updateOrden(
      id,
      orden,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.propiedadImagenService.remove(id);
  }
}