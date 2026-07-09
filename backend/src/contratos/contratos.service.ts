import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contrato, EstadoContrato, FormaPagoContrato } from './entities/contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { CuotasService } from '../cuotas/cuotas.service';
import { ActorContext } from '../common/types/actor-context';
import { RolUsuario } from '../common/enum/roles.enum';
import { PdfService } from '../pdf/pdf.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { buildContratoHtml } from './templates/contrato-pdf.template';
import { Cliente } from '../users/entities/cliente.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Propiedades)
    private propiedadesRepository: Repository<Propiedades>,
    private readonly pdfService: PdfService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificacionesService: NotificacionesService,
    @Optional() @Inject(CuotasService) private cuotasService?: CuotasService,
  ) {}

  async create(createContratoDto: CreateContratoDto, actor: ActorContext): Promise<Contrato> {
    // Validar que el número de contrato sea único
    const exists = await this.contratoRepository.findOneBy({
      numero_contrato: createContratoDto.numero_contrato,
    });

    if (exists) {
      throw new BadRequestException('El número de contrato ya existe');
    }

    // Nunca confiar en corredor_id/empresa_id del body: el servidor los fija según el actor.
    const overrides: Partial<Contrato> = {};
    if (actor.role === RolUsuario.CORREDOR) {
      overrides.corredor_id = actor.id;
      if (actor.empresa_id) overrides.empresa_id = actor.empresa_id;
    } else if (actor.role === RolUsuario.ADMIN_EMPRESA && actor.empresa_id) {
      overrides.empresa_id = actor.empresa_id;
    }

    const contrato = this.contratoRepository.create({
      ...createContratoDto,
      ...overrides,
      estado: EstadoContrato.BORRADOR,
    });

    this.aplicarFechaFinAutomatica(contrato);

    return await this.contratoRepository.save(contrato);
  }

  // Si es por cuotas y se indicó un monto de cuota mensual, calcula fecha_fin
  // automáticamente (el corredor no necesita calcularla ni escribirla a mano).
  private aplicarFechaFinAutomatica(contrato: Contrato): void {
    if (
      contrato.forma_pago === FormaPagoContrato.CUOTAS &&
      contrato.monto_cuota_mensual &&
      this.cuotasService
    ) {
      contrato.fecha_fin = this.cuotasService.calcularFechaFinAutomatica({
        fecha_inicio: new Date(contrato.fecha_inicio),
        monto_total: Number(contrato.monto_total),
        monto_cuota_mensual: Number(contrato.monto_cuota_mensual),
        dia_pago_mensual: contrato.dia_pago_mensual,
      });
    }
  }

  async findAllScoped(actor: ActorContext): Promise<Contrato[]> {
    if (actor.role === RolUsuario.SUPER_ADMIN) return this.findAll();
    if (actor.role === RolUsuario.ADMIN_EMPRESA) return this.findByEmpresa(actor.empresa_id!);
    if (actor.role === RolUsuario.CORREDOR) return this.findByCorredor(actor.id);
    throw new ForbiddenException();
  }

  assertAccess(contrato: Contrato, actor: ActorContext): void {
    if (actor.role === RolUsuario.SUPER_ADMIN) return;
    if (actor.role === RolUsuario.ADMIN_EMPRESA && contrato.empresa_id === actor.empresa_id) return;
    if (actor.role === RolUsuario.CORREDOR && contrato.corredor_id === actor.id) return;
    throw new ForbiddenException('No tiene acceso a este contrato');
  }

  async findOneScoped(id: string, actor: ActorContext): Promise<Contrato> {
    const contrato = await this.findOne(id);
    this.assertAccess(contrato, actor);
    return contrato;
  }

  async findAll(): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOneBy({ id });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contrato;
  }

  async update(id: string, updateContratoDto: UpdateContratoDto, actor: ActorContext): Promise<Contrato> {
    const contrato = await this.findOneScoped(id, actor);

    if (contrato.estado !== EstadoContrato.BORRADOR) {
      throw new BadRequestException(
        'Solo se puede editar un contrato mientras está en BORRADOR',
      );
    }

    Object.assign(contrato, updateContratoDto);
    this.aplicarFechaFinAutomatica(contrato);

    return await this.contratoRepository.save(contrato);
  }

  async activar(id: string, actor: ActorContext): Promise<Contrato> {
    const contrato = await this.findOneScoped(id, actor);

    if (contrato.estado !== EstadoContrato.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden activar contratos en estado BORRADOR',
      );
    }

    if (!contrato.contrato_url) {
      throw new BadRequestException(
        'Debe subir el contrato firmado antes de activarlo',
      );
    }

    contrato.estado = EstadoContrato.ACTIVO;

    // Si el contrato es por cuotas (arriendo o venta a plazo), generar cuotas automáticamente
    if (contrato.forma_pago === FormaPagoContrato.CUOTAS && this.cuotasService) {
      try {
        await this.cuotasService.generarCuotasAutomaticas(id);
      } catch (error) {
        console.warn('Error generando cuotas:', error);
      }
    }

    const guardado = await this.contratoRepository.save(contrato);

    try {
      await this.notificacionesService.notificarContratoActivado(
        guardado.empresa_id,
        guardado.corredor_id,
        guardado.numero_contrato,
      );
    } catch (error) {
      console.warn('Error creando notificación de contrato activado:', error);
    }

    return guardado;
  }

  async finalizar(id: string, actor: ActorContext): Promise<Contrato> {
    const contrato = await this.findOneScoped(id, actor);

    if (contrato.estado !== EstadoContrato.ACTIVO) {
      throw new BadRequestException(
        'Solo se pueden finalizar contratos activos',
      );
    }

    contrato.estado = EstadoContrato.FINALIZADO;

    return await this.contratoRepository.save(contrato);
  }

  async cancelar(id: string, actor: ActorContext): Promise<Contrato> {
    const contrato = await this.findOneScoped(id, actor);

    contrato.estado = EstadoContrato.CANCELADO;

    return await this.contratoRepository.save(contrato);
  }

  async findByEmpresa(empresa_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { empresa_id },
      order: { created_at: 'DESC' },
    });
  }

  async findByCliente(cliente_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { cliente_id },
      order: { created_at: 'DESC' },
    });
  }

  async findByCorredor(corredor_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { corredor_id },
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: string, actor: ActorContext) {
    const contrato = await this.findOneScoped(id, actor);

    // Eliminar cuotas asociadas si está disponible el servicio
    if (this.cuotasService) {
      try {
        await this.cuotasService.eliminarCuotasPorContrato(id);
      } catch (error) {
        console.warn('Error eliminando cuotas:', error);
      }
    }

    await this.contratoRepository.remove(contrato);

    return { message: 'Contrato eliminado correctamente' };
  }

  // Genera el PDF on-demand a partir del estado actual del contrato (no se persiste:
  // así siempre refleja los últimos cambios hechos en el formulario, incluso antes de firmarlo).
  async generarPdf(id: string, actor: ActorContext): Promise<{ buffer: Buffer; contrato: Contrato }> {
    const contrato = await this.findOneScoped(id, actor);

    const [cliente, corredor, empresa, propiedad, cuotas] = await Promise.all([
      this.clienteRepository.findOneBy({ id: contrato.cliente_id }),
      this.usuarioRepository.findOneBy({ id: contrato.corredor_id }),
      this.empresaRepository.findOneBy({ id: contrato.empresa_id }),
      this.propiedadesRepository.findOneBy({ id: contrato.propiedad_id }),
      this.cuotasService ? this.cuotasService.findByContrato(id) : Promise.resolve([]),
    ]);

    const html = buildContratoHtml({ contrato, cliente, corredor, empresa, propiedad, cuotas });
    const buffer = await this.pdfService.htmlToPdf(html);

    return { buffer, contrato };
  }

  // Sube el PDF firmado (subido por el corredor) mientras el contrato aún está en BORRADOR.
  // Activar() luego exige que este campo exista antes de pasar a ACTIVO.
  async subirContratoFirmado(
    id: string,
    file: Express.Multer.File,
    actor: ActorContext,
  ): Promise<Contrato> {
    const contrato = await this.findOneScoped(id, actor);

    if (contrato.estado !== EstadoContrato.BORRADOR) {
      throw new BadRequestException(
        'Solo se puede subir el contrato firmado mientras está en BORRADOR',
      );
    }

    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo en el campo "archivo"');
    }

    const resultado = await this.cloudinaryService.uploadBuffer(file.buffer, 'contratos');
    contrato.contrato_url = resultado.secure_url;
    contrato.public_id = resultado.public_id;

    return await this.contratoRepository.save(contrato);
  }
}
