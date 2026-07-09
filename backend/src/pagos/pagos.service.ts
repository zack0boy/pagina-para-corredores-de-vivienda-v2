import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { EstadoPago } from '../common/enum/estado.enum';
import { ComprobanteEstado } from '../comprobante/entities/comprobante.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { RolUsuario } from '../common/enum/roles.enum';
import { ActorContext } from '../common/types/actor-context';
import { ComprobanteService } from '../comprobante/comprobante.service';
import { CuotasService } from '../cuotas/cuotas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Propiedades)
    private readonly propiedadesRepository: Repository<Propiedades>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly comprobanteService: ComprobanteService,
    private readonly cuotasService: CuotasService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(dto: CreatePagoDto, actor: ActorContext): Promise<Pago> {
    // Nunca confiar en corredor_id del body si quien registra es un corredor.
    if (actor.role === RolUsuario.CORREDOR) {
      dto.corredor_id = actor.id;
    }

    if (!dto.corredor_id) {
      if (dto.propiedad_id) {
        const propiedad = await this.propiedadesRepository.findOne({
          where: { id: dto.propiedad_id },
          select: { corredor_id: true },
        });

        if (propiedad?.corredor_id) {
          dto.corredor_id = propiedad.corredor_id;
        }
      }

      if (!dto.corredor_id && dto.propiedad_titulo) {
        const propiedad = await this.propiedadesRepository.findOne({
          where: { titulo: ILike(dto.propiedad_titulo.trim()) },
          select: { corredor_id: true },
        });

        if (propiedad?.corredor_id) {
          dto.corredor_id = propiedad.corredor_id;
        }
      }
    }

    // Resolver empresa_id en servidor (nunca desde el body) a partir del corredor o la propiedad.
    let empresa_id: string | undefined = actor.role === RolUsuario.ADMIN_EMPRESA ? actor.empresa_id : undefined;
    if (!empresa_id && dto.corredor_id) {
      const corredor = await this.usuarioRepository.findOne({
        where: { id: dto.corredor_id },
        select: { empresaId: true },
      });
      empresa_id = corredor?.empresaId;
    }
    if (!empresa_id && dto.propiedad_id) {
      const propiedad = await this.propiedadesRepository.findOne({
        where: { id: dto.propiedad_id },
        select: { empresa_id: true },
      });
      empresa_id = propiedad?.empresa_id;
    }

    const pago = this.pagoRepository.create({
      ...dto,
      empresa_id,
      fecha_pago: new Date(dto.fecha_pago),
    });
    const guardado = await this.pagoRepository.save(pago);

    if (empresa_id) {
      const admins = await this.usuarioRepository.find({
        where: [
          { empresaId: empresa_id, rol: RolUsuario.ADMIN_EMPRESA },
          { empresaId: empresa_id, rol: RolUsuario.SUPER_ADMIN },
        ],
      });
      for (const admin of admins) {
        await this.notificacionesService.notificarNuevoPago(
          empresa_id,
          admin.id,
          Number(guardado.monto),
          guardado.propiedad_titulo || guardado.cliente_nombre || guardado.id,
        );
      }
    }

    return guardado;
  }

  async findAll(): Promise<Pago[]> {
    return this.pagoRepository.find({ order: { created_at: 'DESC' } });
  }

  async findAllScoped(actor: ActorContext): Promise<Pago[]> {
    if (actor.role === RolUsuario.SUPER_ADMIN) return this.findAll();
    if (actor.role === RolUsuario.ADMIN_EMPRESA) {
      return this.pagoRepository.find({
        where: { empresa_id: actor.empresa_id },
        order: { created_at: 'DESC' },
      });
    }
    if (actor.role === RolUsuario.CORREDOR) return this.findByCorredor(actor.id);
    throw new ForbiddenException();
  }

  async findByCuota(cuota_id: string): Promise<Pago[]> {
    return this.pagoRepository.find({ where: { cuota_id }, order: { fecha_pago: 'DESC' } });
  }

  async findByCliente(cliente_id: string): Promise<Pago[]> {
    return this.pagoRepository.find({ where: { cliente_id }, order: { fecha_pago: 'DESC' } });
  }

  async findByCorredor(corredor_id: string): Promise<Pago[]> {
    const pagosDirectos = await this.pagoRepository.find({
      where: { corredor_id },
      order: { created_at: 'DESC' },
    });

    const propiedades = await this.propiedadesRepository.find({
      where: { corredor_id },
      select: { id: true },
    });

    const propiedadIds = propiedades.map((propiedad) => propiedad.id);

    let pagosPorPropiedad: Pago[] = [];
    if (propiedadIds.length > 0) {
      pagosPorPropiedad = await this.pagoRepository.find({
        where: { propiedad_id: In(propiedadIds) },
        order: { created_at: 'DESC' },
      });
    }

    const combinados = [...pagosDirectos, ...pagosPorPropiedad];
    const vistos = new Set<string>();

    return combinados.filter((pago) => {
      if (!pago.id || vistos.has(pago.id)) {
        return false;
      }
      vistos.add(pago.id);
      return true;
    });
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({ where: { id } });
    if (!pago) throw new NotFoundException(`Pago ${id} no encontrado`);
    return pago;
  }

  assertAccess(pago: Pago, actor: ActorContext): void {
    if (actor.role === RolUsuario.SUPER_ADMIN) return;
    if (actor.role === RolUsuario.ADMIN_EMPRESA && pago.empresa_id === actor.empresa_id) return;
    if (actor.role === RolUsuario.CORREDOR && pago.corredor_id === actor.id) return;
    throw new ForbiddenException('No tiene acceso a este pago');
  }

  async findOneScoped(id: string, actor: ActorContext): Promise<Pago> {
    const pago = await this.findOne(id);
    this.assertAccess(pago, actor);
    return pago;
  }

  async validar(id: string, dto: ValidarPagoDto): Promise<Pago> {
    const pago = await this.findOne(id);
    pago.estado = dto.estado;
    pago.validado_por = dto.validado_por;
    pago.fecha_validacion = new Date();
    if (dto.comentario) pago.comentario = dto.comentario;
    const guardado = await this.pagoRepository.save(pago);

    const aprobado = dto.estado === EstadoPago.VALIDADO;
    await this.comprobanteService.marcarEstadoPorPago(
      pago.id,
      aprobado ? ComprobanteEstado.APROBADO : ComprobanteEstado.RECHAZADO,
      dto.validado_por,
    );

    if (aprobado && pago.cuota_id) {
      await this.cuotasService.registrarPago(pago.cuota_id, Number(pago.monto), pago.fecha_validacion);
    }

    if (pago.empresa_id && pago.corredor_id) {
      await this.notificacionesService.notificarPagoValidado(
        pago.empresa_id,
        pago.corredor_id,
        Number(pago.monto),
        aprobado,
      );
    }

    return guardado;
  }

  async findPendientes(): Promise<Pago[]> {
    return this.pagoRepository.find({
      where: { estado: EstadoPago.PENDIENTE_VALIDACION },
      order: { created_at: 'ASC' },
    });
  }

  // Métricas para el corredor: solo lo que él mismo ha vendido (nunca otros corredores).
  async obtenerResumenCorredor(corredor_id: string): Promise<any> {
    const pagos = await this.findByCorredor(corredor_id);
    return this.resumirPagos(pagos);
  }

  // Métricas para admin/superadmin: agrupadas por corredor DENTRO de una empresa.
  async obtenerResumenEmpresa(empresa_id: string): Promise<any> {
    const pagos = await this.pagoRepository.find({ where: { empresa_id } });
    const corredores = await this.usuarioRepository.find({
      where: { empresaId: empresa_id, rol: RolUsuario.CORREDOR },
    });

    const porCorredor = corredores.map((corredor) => {
      const pagosCorredor = pagos.filter((p) => p.corredor_id === corredor.id);
      return {
        corredor_id: corredor.id,
        nombre: corredor.nombre,
        ...this.resumirPagos(pagosCorredor),
      };
    });

    return {
      empresa_id,
      totalEmpresa: this.resumirPagos(pagos),
      porCorredor,
    };
  }

  // Todas las empresas, cada una con sus propias métricas SIN mezclar entre sí.
  async obtenerResumenTodasEmpresas(): Promise<any[]> {
    const empresaIds = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('DISTINCT pago.empresa_id', 'empresa_id')
      .where('pago.empresa_id IS NOT NULL')
      .getRawMany();

    return Promise.all(
      empresaIds.map((row) => this.obtenerResumenEmpresa(row.empresa_id)),
    );
  }

  private resumirPagos(pagos: Pago[]) {
    const suma = (lista: Pago[]) => lista.reduce((s, p) => s + Number(p.monto || 0), 0);
    const validados = pagos.filter((p) => p.estado === EstadoPago.VALIDADO);
    const pendientes = pagos.filter((p) => p.estado === EstadoPago.PENDIENTE_VALIDACION);
    const rechazados = pagos.filter((p) => p.estado === EstadoPago.RECHAZADO);

    return {
      cantidadPagos: pagos.length,
      totalVendido: suma(validados),
      totalPendiente: suma(pendientes),
      totalRechazado: suma(rechazados),
      cantidadValidados: validados.length,
      cantidadPendientes: pendientes.length,
      cantidadRechazados: rechazados.length,
    };
  }
}
