import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cuota, EstadoCuota } from './entities/cuota.entity';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { Contrato } from '../contratos/entities/contrato.entity';

@Injectable()
export class CuotasService {
  constructor(
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
  ) {}

  // ====================================
  // Lógica de Generación de Cuotas
  // ====================================

  /**
   * Generar cuotas automáticamente para contratos de arriendo
   * Calcula el número de cuotas según los meses entre fecha_inicio y fecha_fin
   * @param contrato_id ID del contrato
   */
  async generarCuotasPorArriendo(contrato_id: string): Promise<Cuota[]> {
    const contrato = await this.contratoRepository.findOneBy({ id: contrato_id });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    if (contrato.tipo !== 'ARRIENDO') {
      throw new BadRequestException(
        'Solo se pueden generar cuotas para contratos de arriendo',
      );
    }

    if (!contrato.fecha_fin) {
      throw new BadRequestException(
        'El contrato debe tener fecha de fin para generar cuotas',
      );
    }

    // Calcular número de meses
    const fechaInicio = new Date(contrato.fecha_inicio);
    const fechaFin = new Date(contrato.fecha_fin);

    const meses = this.calcularMesesEntre(fechaInicio, fechaFin);

    if (meses <= 0) {
      throw new BadRequestException(
        'La duración del contrato debe ser mayor a 0 meses',
      );
    }

    // Calcular monto por cuota
    const montoPorCuota = Number(
      (Number(contrato.monto_total) / meses).toFixed(2),
    );

    // Generar las cuotas
    const cuotas: Cuota[] = [];

    for (let i = 1; i <= meses; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      const cuota = this.cuotaRepository.create({
        contrato_id,
        numero_cuota: i,
        monto_total: montoPorCuota,
        saldo_pendiente: montoPorCuota,
        fecha_vencimiento: fechaVencimiento,
        estado: EstadoCuota.PENDIENTE,
      });

      cuotas.push(await this.cuotaRepository.save(cuota));
    }

    return cuotas;
  }

  /**
   * Calcular la diferencia en meses entre dos fechas
   */
  private calcularMesesEntre(fechaInicio: Date, fechaFin: Date): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    let meses = 0;
    while (inicio < fin) {
      inicio.setMonth(inicio.getMonth() + 1);
      meses++;
    }

    return meses;
  }

  // ====================================
  // CRUD Básico de Cuotas
  // ====================================

  async create(createCuotaDto: CreateCuotaDto): Promise<Cuota> {
    const contrato = await this.contratoRepository.findOneBy({
      id: createCuotaDto.contrato_id,
    });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    // Verificar que el número de cuota sea único para este contrato
    const exists = await this.cuotaRepository.findOneBy({
      contrato_id: createCuotaDto.contrato_id,
      numero_cuota: createCuotaDto.numero_cuota,
    });

    if (exists) {
      throw new BadRequestException(
        'Ya existe una cuota con ese número para este contrato',
      );
    }

    const cuota = this.cuotaRepository.create({
      ...createCuotaDto,
      saldo_pendiente: createCuotaDto.monto_total,
      estado: EstadoCuota.PENDIENTE,
    });

    return await this.cuotaRepository.save(cuota);
  }

  async findAll(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      order: { numero_cuota: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Cuota> {
    const cuota = await this.cuotaRepository.findOneBy({ id });

    if (!cuota) {
      throw new NotFoundException('Cuota no encontrada');
    }

    return cuota;
  }

  async update(id: string, updateCuotaDto: UpdateCuotaDto): Promise<Cuota> {
    const cuota = await this.findOne(id);

    Object.assign(cuota, updateCuotaDto);

    return await this.cuotaRepository.save(cuota);
  }

  async registrarPago(
    id: string,
    monto: number,
    fecha_pago: Date,
  ): Promise<Cuota> {
    const cuota = await this.findOne(id);

    if (cuota.estado === EstadoCuota.PAGADA) {
      throw new BadRequestException('La cuota ya ha sido pagada');
    }

    const montoPagado = Number(
      (Number(cuota.monto_pagado) + monto).toFixed(2),
    );
    const saldoPendiente = Number(
      (Number(cuota.monto_total) - montoPagado).toFixed(2),
    );

    cuota.monto_pagado = montoPagado;
    cuota.saldo_pendiente = saldoPendiente;
    cuota.fecha_pago = fecha_pago;

    // Determinar el estado
    if (saldoPendiente === 0) {
      cuota.estado = EstadoCuota.PAGADA;
    } else if (montoPagado > 0) {
      cuota.estado = EstadoCuota.PARCIAL;
    }

    return await this.cuotaRepository.save(cuota);
  }

  async marcarVencida(id: string): Promise<Cuota> {
    const cuota = await this.findOne(id);

    if (
      cuota.estado === EstadoCuota.PAGADA ||
      cuota.estado === EstadoCuota.ANULADA
    ) {
      throw new BadRequestException(
        'No se puede marcar como vencida una cuota pagada o anulada',
      );
    }

    cuota.estado = EstadoCuota.VENCIDA;

    return await this.cuotaRepository.save(cuota);
  }

  async anular(id: string): Promise<Cuota> {
    const cuota = await this.findOne(id);

    cuota.estado = EstadoCuota.ANULADA;
    cuota.monto_pagado = 0;
    cuota.saldo_pendiente = 0;

    return await this.cuotaRepository.save(cuota);
  }

  async findByContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { contrato_id },
      order: { numero_cuota: 'ASC' },
    });
  }

  async obtenerReporteCuotas(contrato_id: string): Promise<any> {
    const cuotas = await this.findByContrato(contrato_id);

    const totalCuotas = cuotas.length;
    const cuotasPagadas = cuotas.filter(
      (c) => c.estado === EstadoCuota.PAGADA,
    ).length;
    const cuotasVencidas = cuotas.filter(
      (c) => c.estado === EstadoCuota.VENCIDA,
    ).length;
    const montoTotal = cuotas.reduce((sum, c) => sum + Number(c.monto_total), 0);
    const montoPagado = cuotas.reduce(
      (sum, c) => sum + Number(c.monto_pagado),
      0,
    );
    const saldoPendiente = cuotas.reduce(
      (sum, c) => sum + Number(c.saldo_pendiente),
      0,
    );

    return {
      totalCuotas,
      cuotasPagadas,
      cuotasVencidas,
      cuotasPendientes: totalCuotas - cuotasPagadas - cuotasVencidas,
      montoTotal: Number(montoTotal.toFixed(2)),
      montoPagado: Number(montoPagado.toFixed(2)),
      saldoPendiente: Number(saldoPendiente.toFixed(2)),
      porcentajePago: Number(
        ((montoPagado / montoTotal) * 100).toFixed(2),
      ),
      cuotas,
    };
  }

  // ====================================
  // Gestión de Cuotas por Estado
  // ====================================

  async obtenerCuotasPendientes(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { estado: EstadoCuota.PENDIENTE },
      order: { fecha_vencimiento: 'ASC' },
    });
  }

  async obtenerCuotasPendientesPorContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { 
        contrato_id,
        estado: EstadoCuota.PENDIENTE 
      },
      order: { numero_cuota: 'ASC' },
    });
  }

  async obtenerCuotasPagadas(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { estado: EstadoCuota.PAGADA },
      order: { fecha_pago: 'DESC' },
    });
  }

  async obtenerCuotasPagadasPorContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { 
        contrato_id,
        estado: EstadoCuota.PAGADA 
      },
      order: { numero_cuota: 'ASC' },
    });
  }

  async obtenerCuotasVencidas(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { estado: EstadoCuota.VENCIDA },
      order: { fecha_vencimiento: 'ASC' },
    });
  }

  async obtenerCuotasVencidasPorContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { 
        contrato_id,
        estado: EstadoCuota.VENCIDA 
      },
      order: { numero_cuota: 'ASC' },
    });
  }

  async obtenerCuotasParciales(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { estado: EstadoCuota.PARCIAL },
      order: { fecha_vencimiento: 'ASC' },
    });
  }

  async obtenerCuotasParcialesPorContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: { 
        contrato_id,
        estado: EstadoCuota.PARCIAL 
      },
      order: { numero_cuota: 'ASC' },
    });
  }

  async obtenerCuotasSinPagar(): Promise<Cuota[]> {
    return await this.cuotaRepository.find({
      where: [
        { estado: EstadoCuota.PENDIENTE },
        { estado: EstadoCuota.PARCIAL },
        { estado: EstadoCuota.VENCIDA },
      ],
      order: { fecha_vencimiento: 'ASC' },
    });
  }

  async obtenerCuotasSinPagarPorContrato(contrato_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository
      .createQueryBuilder('cuota')
      .where('cuota.contrato_id = :contrato_id', { contrato_id })
      .andWhere('cuota.estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL, EstadoCuota.VENCIDA],
      })
      .orderBy('cuota.numero_cuota', 'ASC')
      .getMany();
  }

  async obtenerResumenCuotasPorEmpresa(empresa_id: string): Promise<any> {
    const cuotas = await this.cuotaRepository
      .createQueryBuilder('cuota')
      .innerJoin('cuota.contrato_id', 'contrato')
      .where('contrato.empresa_id = :empresa_id', { empresa_id })
      .getMany();

    return {
      totalCuotas: cuotas.length,
      pagadas: cuotas.filter(c => c.estado === EstadoCuota.PAGADA).length,
      pendientes: cuotas.filter(c => c.estado === EstadoCuota.PENDIENTE).length,
      parciales: cuotas.filter(c => c.estado === EstadoCuota.PARCIAL).length,
      vencidas: cuotas.filter(c => c.estado === EstadoCuota.VENCIDA).length,
      montoTotal: cuotas.reduce((sum, c) => sum + Number(c.monto_total), 0),
      montoPagado: cuotas.reduce((sum, c) => sum + Number(c.monto_pagado), 0),
      saldoPendiente: cuotas.reduce((sum, c) => sum + Number(c.saldo_pendiente), 0),
    };
  }

  async marcarVencidasPorFecha(): Promise<number> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const resultado = await this.cuotaRepository
      .createQueryBuilder()
      .update(Cuota)
      .set({ estado: EstadoCuota.VENCIDA })
      .where('fecha_vencimiento < :hoy', { hoy })
      .andWhere('estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL],
      })
      .execute();

    return resultado.affected || 0;
  }

  // ====================================
  // Métodos Internos
  // ====================================

  async eliminarCuotasPorContrato(contrato_id: string): Promise<void> {
    const cuotas = await this.findByContrato(contrato_id);

    for (const cuota of cuotas) {
      await this.cuotaRepository.remove(cuota);
    }
  }

  async remove(id: string) {
    const cuota = await this.findOne(id);

    await this.cuotaRepository.remove(cuota);

    return { message: 'Cuota eliminada correctamente' };
  }
}
