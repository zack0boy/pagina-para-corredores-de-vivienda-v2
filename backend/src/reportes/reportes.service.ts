import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Pago } from '../pagos/entities/pago.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { EstadoPago } from '../common/enum/estado.enum';
import { RolUsuario } from '../common/enum/roles.enum';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  private rango(desde?: string, hasta?: string): { inicio: Date; fin: Date } {
    const fin = hasta ? new Date(hasta) : new Date();
    const inicio = desde
      ? new Date(desde)
      : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { inicio, fin };
  }

  // Resumen común para SUPER_ADMIN y ADMIN_EMPRESA:
  // totales generales + resumen financiero del período (por defecto últimos 30 días)
  async resumen(desde?: string, hasta?: string) {
    const { inicio, fin } = this.rango(desde, hasta);

    const [empresas, usuarios, propiedades, corredores, pagosPeriodo] =
      await Promise.all([
        this.empresaRepository.count(),
        this.usuarioRepository.count(),
        this.propiedadRepository.count(),
        this.usuarioRepository.count({ where: { rol: RolUsuario.CORREDOR } }),
        this.pagoRepository.find({
          where: { fecha_pago: Between(inicio, fin) },
          order: { fecha_pago: 'DESC' },
        }),
      ]);

    const suma = (lista: Pago[]) =>
      lista.reduce((s, p) => s + (Number(p.monto) || 0), 0);

    const validados = pagosPeriodo.filter((p) => p.estado === EstadoPago.VALIDADO);
    const pendientes = pagosPeriodo.filter(
      (p) => p.estado === EstadoPago.PENDIENTE_VALIDACION,
    );
    const rechazados = pagosPeriodo.filter((p) => p.estado === EstadoPago.RECHAZADO);

    return {
      periodo: { desde: inicio.toISOString(), hasta: fin.toISOString() },
      totales: { empresas, usuarios, propiedades, corredores },
      financiero: {
        pagos: pagosPeriodo.length,
        montoTotal: suma(pagosPeriodo),
        cobrado: suma(validados),
        pendiente: suma(pendientes),
        rechazado: suma(rechazados),
        cantidadValidados: validados.length,
        cantidadPendientes: pendientes.length,
        cantidadRechazados: rechazados.length,
      },
    };
  }

  // Reporte 3: propiedades agrupadas por estado
  async propiedadesPorEstado() {
    const filas = await this.propiedadRepository
      .createQueryBuilder('propiedad')
      .select('propiedad.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('propiedad.estado')
      .getRawMany();

    const total = filas.reduce((s, f) => s + Number(f.cantidad), 0);
    return {
      total,
      porEstado: filas.map((f) => ({
        estado: f.estado,
        cantidad: Number(f.cantidad),
      })),
    };
  }

  // Reporte 4: usuarios por rol + estado de los clientes
  async usuariosPorRol() {
    const [filasRol, clientesActivos, clientesBloqueados] = await Promise.all([
      this.usuarioRepository
        .createQueryBuilder('usuario')
        .select('usuario.rol', 'rol')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('usuario.rol')
        .getRawMany(),
      this.clienteRepository.count({ where: { activo: true } }),
      this.clienteRepository.count({ where: { activo: false } }),
    ]);

    return {
      porRol: filasRol.map((f) => ({ rol: f.rol, cantidad: Number(f.cantidad) })),
      clientes: {
        total: clientesActivos + clientesBloqueados,
        activos: clientesActivos,
        bloqueados: clientesBloqueados,
      },
    };
  }

  // Reporte 5 (solo SUPER_ADMIN): empresas con sus corredores y propiedades
  async empresasResumen() {
    const empresas = await this.empresaRepository.find({
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      empresas.map(async (empresa) => {
        const [corredores, propiedades, admins] = await Promise.all([
          this.usuarioRepository.count({
            where: { empresaId: empresa.id, rol: RolUsuario.CORREDOR },
          }),
          this.propiedadRepository.count({ where: { empresa_id: empresa.id } }),
          this.usuarioRepository.count({
            where: { empresaId: empresa.id, rol: RolUsuario.ADMIN_EMPRESA },
          }),
        ]);

        return {
          id: empresa.id,
          nombre: empresa.nombre,
          estado: empresa.estado,
          plan: empresa.plan,
          corredores,
          propiedades,
          admins,
        };
      }),
    );
  }

  async pagosDetalle(desde?: string, hasta?: string): Promise<Pago[]> {
    const { inicio, fin } = this.rango(desde, hasta);
    return this.pagoRepository.find({
      where: { fecha_pago: Between(inicio, fin) },
      order: { fecha_pago: 'DESC' },
    });
  }

  // Documento CSV con el detalle de pagos del período
  async exportarPagosCsv(desde?: string, hasta?: string): Promise<string> {
    const pagos = await this.pagosDetalle(desde, hasta);

    const escapar = (valor: unknown): string => {
      const texto = valor === null || valor === undefined ? '' : String(valor);
      return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
    };

    const cabecera = [
      'ID',
      'Fecha pago',
      'Cliente',
      'Propiedad',
      'Monto',
      'Estado',
      'Tipo pago',
      'Comentario',
    ];

    const filas = pagos.map((p) =>
      [
        p.id,
        p.fecha_pago ? new Date(p.fecha_pago).toISOString().slice(0, 10) : '',
        p.cliente_nombre ?? p.cliente_id ?? '',
        p.propiedad_titulo ?? p.propiedad_id ?? '',
        p.monto,
        p.estado,
        p.tipo_pago,
        p.comentario ?? '',
      ]
        .map(escapar)
        .join(';'),
    );

    // BOM para que Excel abra el archivo con acentos correctos
    return '﻿' + [cabecera.join(';'), ...filas].join('\n');
  }
}
