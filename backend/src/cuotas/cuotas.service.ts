import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cuota, EstadoCuota } from './entities/cuota.entity';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { Contrato } from '../contratos/entities/contrato.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EventosCalendarioService } from '../eventos-calendario/eventos-calendario.service';
import { TipoEvento } from '../common/enum/estado.enum';

@Injectable()
export class CuotasService {
  private readonly logger = new Logger(CuotasService.name);

  constructor(
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    private notificacionesService: NotificacionesService,
    private eventosCalendarioService: EventosCalendarioService,
  ) {}

  // ====================================
  // Lógica de Generación de Cuotas
  // ====================================

  /**
   * Calcula meses, fechas de vencimiento y monto de cada cuota, sin tocar la base de datos.
   * Si se entrega monto_cuota_mensual, los meses se derivan de monto_total / monto_cuota_mensual
   * (redondeando hacia arriba) — así el corredor no tiene que calcular ni escribir fecha_fin.
   * Si no, se usa el rango fecha_inicio..fecha_fin (comportamiento histórico).
   * La última cuota siempre absorbe el resto para que la suma cuadre exacto con monto_total.
   */
  calcularPlanDeCuotas(params: {
    fecha_inicio: Date;
    fecha_fin?: Date | null;
    monto_total: number;
    monto_cuota_mensual?: number | null;
    dia_pago_mensual?: number | null;
  }): { meses: number; fechas: Date[]; montos: number[] } {
    const { fecha_inicio, fecha_fin, monto_total, monto_cuota_mensual, dia_pago_mensual } = params;
    const diaPago = dia_pago_mensual ?? fecha_inicio.getDate();

    let meses: number;
    if (monto_cuota_mensual && Number(monto_cuota_mensual) > 0) {
      meses = Math.max(1, Math.ceil(Number(monto_total) / Number(monto_cuota_mensual)));
    } else {
      if (!fecha_fin) {
        throw new BadRequestException(
          'El contrato debe tener fecha de fin o un monto de cuota mensual para generar cuotas',
        );
      }
      meses = this.calcularMesesEntre(fecha_inicio, fecha_fin);
      if (meses <= 0) {
        throw new BadRequestException('La duración del contrato debe ser mayor a 0 meses');
      }
    }

    const fechas = this.generarFechasMensuales(fecha_inicio, meses, diaPago);
    const montoBase = monto_cuota_mensual && Number(monto_cuota_mensual) > 0
      ? Number(monto_cuota_mensual)
      : Number((Number(monto_total) / meses).toFixed(2));
    const montos = new Array(meses).fill(montoBase);
    // La última cuota absorbe el resto para que la suma cuadre exacto con monto_total.
    const sumaAnteriores = montoBase * (meses - 1);
    montos[meses - 1] = Number((Number(monto_total) - sumaAnteriores).toFixed(2));

    return { meses, fechas, montos };
  }

  // Un vencimiento por mes, en el día indicado (recortado al último día del mes si no existe,
  // ej. día 31 en abril → 30 de abril).
  private generarFechasMensuales(fechaInicio: Date, meses: number, diaPago: number): Date[] {
    const fechas: Date[] = [];
    for (let i = 1; i <= meses; i++) {
      const anio = fechaInicio.getFullYear();
      const mes = fechaInicio.getMonth() + i;
      const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
      const dia = Math.min(diaPago, ultimoDiaMes);
      fechas.push(new Date(anio, mes, dia));
    }
    return fechas;
  }

  // Calcula fecha_fin automáticamente a partir de monto_cuota_mensual (sin persistir nada).
  // Usado por ContratosService al crear/editar un contrato en CUOTAS para que el corredor
  // no tenga que escribir la fecha de término a mano.
  calcularFechaFinAutomatica(params: {
    fecha_inicio: Date;
    monto_total: number;
    monto_cuota_mensual: number;
    dia_pago_mensual?: number | null;
  }): Date {
    const { fechas } = this.calcularPlanDeCuotas({
      fecha_inicio: params.fecha_inicio,
      monto_total: params.monto_total,
      monto_cuota_mensual: params.monto_cuota_mensual,
      dia_pago_mensual: params.dia_pago_mensual,
    });
    return fechas[fechas.length - 1];
  }

  /**
   * Genera y persiste las cuotas de un contrato (ARRIENDO o VENTA por cuotas).
   * @param contrato_id ID del contrato
   */
  async generarCuotasAutomaticas(contrato_id: string): Promise<Cuota[]> {
    const contrato = await this.contratoRepository.findOneBy({ id: contrato_id });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    const { fechas, montos } = this.calcularPlanDeCuotas({
      fecha_inicio: new Date(contrato.fecha_inicio),
      fecha_fin: contrato.fecha_fin ? new Date(contrato.fecha_fin) : null,
      monto_total: Number(contrato.monto_total),
      monto_cuota_mensual: contrato.monto_cuota_mensual ? Number(contrato.monto_cuota_mensual) : null,
      dia_pago_mensual: contrato.dia_pago_mensual ?? null,
    });

    // Generar las cuotas
    const cuotas: Cuota[] = [];

    for (let i = 0; i < fechas.length; i++) {
      const cuota = this.cuotaRepository.create({
        contrato_id,
        numero_cuota: i + 1,
        monto_total: montos[i],
        saldo_pendiente: montos[i],
        fecha_vencimiento: fechas[i],
        estado: EstadoCuota.PENDIENTE,
      });

      const guardada = await this.cuotaRepository.save(cuota);
      cuotas.push(guardada);

      // Best-effort: crea un evento de calendario (y sincroniza con Google si está
      // configurado) para el vencimiento de cada cuota. Nunca bloquea la generación.
      try {
        await this.eventosCalendarioService.create({
          empresa_id: contrato.empresa_id,
          corredor_id: contrato.corredor_id,
          tipo: TipoEvento.VENCIMIENTO_CUOTA,
          titulo: `Vencimiento cuota #${guardada.numero_cuota} — Contrato ${contrato.numero_contrato}`,
          fecha_inicio: guardada.fecha_vencimiento.toString(),
          fecha_fin: guardada.fecha_vencimiento.toString(),
          contrato_id: contrato.id,
          cuota_id: guardada.id,
        });
      } catch (error) {
        this.logger.warn(`Error creando evento de calendario para cuota ${guardada.id}: ${error}`);
      }
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
      .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
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

  async obtenerCuotasPendientesPorCorredor(corredor_id: string): Promise<Cuota[]> {
    return await this.cuotaRepository
      .createQueryBuilder('cuota')
      .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
      .where('contrato.corredor_id = :corredor_id', { corredor_id })
      .andWhere('cuota.estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL],
      })
      .orderBy('cuota.fecha_vencimiento', 'ASC')
      .getMany();
  }

  async obtenerResumenCuotasPorCorredor(corredor_id: string): Promise<any> {
    const cuotas = await this.cuotaRepository
      .createQueryBuilder('cuota')
      .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
      .where('contrato.corredor_id = :corredor_id', { corredor_id })
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

    // Obtener cuotas que vencen hoy (antes de marcarlas como vencidas)
    const cuotasVencidasHoy = await this.cuotaRepository
      .createQueryBuilder('cuota')
      .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
      .where('DATE(cuota.fecha_vencimiento) = :hoy', { hoy })
      .andWhere('cuota.estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL],
      })
      .getMany();

    // Marcar como vencidas
    const resultado = await this.cuotaRepository
      .createQueryBuilder()
      .update(Cuota)
      .set({ estado: EstadoCuota.VENCIDA })
      .where('fecha_vencimiento < :hoy', { hoy })
      .andWhere('estado IN (:...estados)', {
        estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL],
      })
      .execute();

    // 🔔 Crear notificaciones para las cuotas que se acaban de vencer
    for (const cuota of cuotasVencidasHoy) {
      try {
        const contrato = await this.contratoRepository.findOneBy({
          id: cuota.contrato_id,
        });
        if (contrato) {
          await this.notificacionesService.notificarCuotaProxima(
            contrato.empresa_id,
            contrato.corredor_id,
            cuota.numero_cuota,
            cuota.fecha_vencimiento,
            0, // 0 días = vencida hoy
          );
        }
      } catch (error) {
        console.warn(
          `Error al crear notificación de cuota vencida ${cuota.id}:`,
          error,
        );
      }
    }

    return resultado.affected || 0;
  }

  async crearNotificacionesCuotasProximas(): Promise<number> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let notificacionesCreadas = 0;
    const diasAVerificar = [1, 3, 7];

    for (const dias of diasAVerificar) {
      const fechaDestino = new Date(hoy);
      fechaDestino.setDate(fechaDestino.getDate() + dias);

      const cuotasProximas = await this.cuotaRepository
        .createQueryBuilder('cuota')
        .innerJoin(Contrato, 'contrato', 'cuota.contrato_id = contrato.id')
        .where('DATE(cuota.fecha_vencimiento) = :fecha', { fecha: fechaDestino })
        .andWhere('cuota.estado IN (:...estados)', {
          estados: [EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL],
        })
        .getMany();

      for (const cuota of cuotasProximas) {
        try {
          const contrato = await this.contratoRepository.findOneBy({
            id: cuota.contrato_id,
          });
          if (contrato) {
            await this.notificacionesService.notificarCuotaProxima(
              contrato.empresa_id,
              contrato.corredor_id,
              cuota.numero_cuota,
              cuota.fecha_vencimiento,
              dias,
            );
            notificacionesCreadas++;
          }
        } catch (error) {
          console.warn(
            `Error al crear notificación de cuota próxima ${cuota.id}:`,
            error,
          );
        }
      }
    }

    return notificacionesCreadas;
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
