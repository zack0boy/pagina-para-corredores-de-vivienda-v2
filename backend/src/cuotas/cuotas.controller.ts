import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { CuotasService } from './cuotas.service';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';

@Controller('cuotas')
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) {}

  // ====================================
  // POST /cuotas
  // Crear una nueva cuota manualmente
  // ====================================
  @Post()
  create(@Body() createCuotaDto: CreateCuotaDto) {
    return this.cuotasService.create(createCuotaDto);
  }

  // ====================================
  // GET /cuotas
  // Obtener todas las cuotas
  // ====================================
  @Get()
  findAll() {
    return this.cuotasService.findAll();
  }

  // ====================================
  // GET /cuotas/:id
  // Obtener una cuota por ID
  // ====================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuotasService.findOne(id);
  }

  // ====================================
  // GET /cuotas/contrato/:contrato_id
  // Obtener cuotas de un contrato
  // ====================================
  @Get('contrato/:contrato_id')
  findByContrato(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.findByContrato(contrato_id);
  }

  // ====================================
  // GET /cuotas/reporte/:contrato_id
  // Obtener reporte de cuotas de un contrato
  // ====================================
  @Get('reporte/:contrato_id')
  obtenerReporte(@Param('contrato_id') contrato_id: string) {
    return this.cuotasService.obtenerReporteCuotas(contrato_id);
  }

  // ====================================
  // PATCH /cuotas/:id
  // Actualizar una cuota
  // ====================================
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCuotaDto: UpdateCuotaDto,
  ) {
    return this.cuotasService.update(id, updateCuotaDto);
  }

  // ====================================
  // PATCH /cuotas/:id/pago
  // Registrar un pago en la cuota
  // ====================================
  @Patch(':id/pago')
  registrarPago(
    @Param('id') id: string,
    @Body() body: { monto: number; fecha_pago: string },
  ) {
    return this.cuotasService.registrarPago(
      id,
      body.monto,
      new Date(body.fecha_pago),
    );
  }

  // ====================================
  // PATCH /cuotas/:id/vencida
  // Marcar cuota como vencida
  // ====================================
  @Patch(':id/vencida')
  marcarVencida(@Param('id') id: string) {
    return this.cuotasService.marcarVencida(id);
  }

  // ====================================
  // PATCH /cuotas/:id/anular
  // Anular una cuota
  // ====================================
  @Patch(':id/anular')
  anular(@Param('id') id: string) {
    return this.cuotasService.anular(id);
  }

  // ====================================
  // DELETE /cuotas/:id
  // Eliminar una cuota
  // ====================================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuotasService.remove(id);
  }
}
