import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Propiedades } from './entities/propiedades.entity';
import { PropiedadImagen } from '../propiedad-imagen/entities/propiedad-imagen.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { HistorialPropiedad } from './entities/historial-propiedad.entity';

import { CreatePropiedadesDto } from './dto/create-propiedades.dto';
import { UpdatePropiedadesDto } from './dto/update-propiedades.dto';
import { FilterPropiedadesDto } from './dto/filter-propiedades.dto';

@Injectable()
export class PropiedadesService {
  constructor(
    @InjectRepository(Propiedades)
    private propiedadRepository: Repository<Propiedades>,
    @InjectRepository(PropiedadImagen)
    private imagenRepository: Repository<PropiedadImagen>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(HistorialPropiedad)
    private historialRepository: Repository<HistorialPropiedad>,
  ) {}

  // Registra un cambio en el historial (no rompe si falla)
  private async registrarHistorial(
    propiedad_id: string | undefined,
    corredor_id: string | undefined,
    accion: string,
    detalle: string,
  ) {
    try {
      await this.historialRepository.save(
        this.historialRepository.create({ propiedad_id, corredor_id, accion, detalle }),
      );
    } catch {
      /* el historial no debe interrumpir la operación principal */
    }
  }

  async create(createPropiedadesDto: CreatePropiedadesDto) {
    // Si no viene código, lo generamos automáticamente y único
    const codigo =
      createPropiedadesDto.codigo && createPropiedadesDto.codigo.trim() !== ''
        ? createPropiedadesDto.codigo
        : this.generarCodigo();

    const propiedad = this.propiedadRepository.create({
      ...createPropiedadesDto,
      codigo,
    });

    const guardada = await this.propiedadRepository.save(propiedad);
    await this.registrarHistorial(
      guardada.id,
      guardada.corredor_id,
      'CREADA',
      `Propiedad "${guardada.titulo}" publicada.`,
    );
    return guardada;
  }

  // Genera un código tipo PROP-A1B2C3 (suficientemente único)
  private generarCodigo(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tiempo = Date.now().toString(36).slice(-3).toUpperCase();
    return `PROP-${random}${tiempo}`;
  }

  findAll() {
    return this.propiedadRepository.find();
  }

  async findWithFilters(filters: FilterPropiedadesDto) {
    const query = this.propiedadRepository.createQueryBuilder('propiedad');

    if (filters.categoriaId && filters.categoriaId !== 'undefined' && filters.categoriaId !== 'null') {
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(filters.categoriaId);
      
      if (isUUID) {
        query.andWhere('propiedad.categoria_id = :categoriaId', { categoriaId: filters.categoriaId });
      }
    }


    if (filters.corredorId) {
      query.andWhere('propiedad.corredor_id = :corredorId', { corredorId: filters.corredorId });
    }

    if (filters.tipoOperacion) {
      query.andWhere('propiedad.tipo_operacion = :tipoOperacion', { tipoOperacion: filters.tipoOperacion });
    }

    if (filters.estado) {
      query.andWhere('propiedad.estado = :estado', { estado: filters.estado });
    }

    if (filters.precioMin) {
      query.andWhere('propiedad.precio >= :precioMin', { precioMin: filters.precioMin });
    }

    if (filters.precioMax) {
      query.andWhere('propiedad.precio <= :precioMax', { precioMax: filters.precioMax });
    }

    if (filters.habitaciones) {
        query.andWhere('propiedad.habitaciones >= :habitaciones', { habitaciones: filters.habitaciones });
    }

    if (filters.banos) {
      query.andWhere('propiedad.banos = :banos', { banos: filters.banos });
    }

    if (filters.estacionamientos) {
      query.andWhere('propiedad.estacionamientos = :estacionamientos', { estacionamientos: filters.estacionamientos });
    }

    if (filters.nombre) {
        query.andWhere('propiedad.titulo ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    if (filters.empresaId) {
      query.andWhere('propiedad.empresa_id = :empresaId', { empresaId: filters.empresaId });
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    query.skip(skip).take(filters.limit || 10);

    // 1ª consulta: las propiedades de la página
    const data = await query.getMany();

    // El conteo total y las imágenes no dependen entre sí → corren en paralelo
    const [total, dataConImagenes] = await Promise.all([
      query.getCount(),
      this.adjuntarImagenes(data),
    ]);

    return {
      data: dataConImagenes,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  // Carga las imágenes de varias propiedades de una vez y las agrupa por propiedad
  private async adjuntarImagenes(propiedades: Propiedades[]) {
    if (propiedades.length === 0) return propiedades;

    const ids = propiedades.map((p) => p.id);
    const imagenes = await this.imagenRepository
      .createQueryBuilder('img')
      .select(['img.id', 'img.propiedad_id', 'img.url', 'img.orden'])
      .where('img.propiedad_id IN (:...ids)', { ids })
      .orderBy('img.orden', 'ASC')
      .getMany();

    // Agrupamos las imágenes por propiedad_id
    const porPropiedad: Record<string, any[]> = {};
    for (const img of imagenes) {
      (porPropiedad[img.propiedad_id] ??= []).push(img);
    }

    return propiedades.map((p) => ({
      ...p,
      imagenes: porPropiedad[p.id] ?? [],
    }));
  }

  async findOne(id: string) {
    const propiedad = await this.propiedadRepository.findOneBy({ id });
    if (!propiedad) return null;

    // Cargar las imágenes de la propiedad ordenadas.
    // Seleccionamos solo las columnas necesarias para no depender de
    // columnas opcionales (public_id) que podrían no existir en la tabla.
    const imagenes = await this.imagenRepository
      .createQueryBuilder('img')
      .select(['img.id', 'img.propiedad_id', 'img.url', 'img.orden'])
      .where('img.propiedad_id = :id', { id })
      .orderBy('img.orden', 'ASC')
      .getMany();

    // Datos de contacto del corredor (sin exponer la contraseña)
    let corredor: any = null;
    if (propiedad.corredor_id) {
      const u = await this.usuarioRepository.findOne({
        where: { id: propiedad.corredor_id },
      });
      if (u) {
        corredor = {
          id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          telefono: u.telefono,
        };
      }
    }

    return { ...propiedad, imagenes, corredor };
  }

  async update(
    id: string,
    updatePropiedadesDto: UpdatePropiedadesDto,
  ) {
    const antes = await this.propiedadRepository.findOneBy({ id });

    await this.propiedadRepository.update(id, updatePropiedadesDto);

    // Registrar en historial
    if (antes) {
      if (updatePropiedadesDto.estado && updatePropiedadesDto.estado !== antes.estado) {
        await this.registrarHistorial(
          id, antes.corredor_id, 'ESTADO_CAMBIADO',
          `Estado: ${antes.estado} → ${updatePropiedadesDto.estado}.`,
        );
      } else {
        await this.registrarHistorial(
          id, antes.corredor_id, 'ACTUALIZADA',
          `Se editaron los datos de "${antes.titulo}".`,
        );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const antes = await this.propiedadRepository.findOneBy({ id });
    await this.propiedadRepository.delete(id);
    if (antes) {
      await this.registrarHistorial(
        id, antes.corredor_id, 'ELIMINADA',
        `Propiedad "${antes.titulo}" eliminada.`,
      );
    }
    return { message: 'Propiedad eliminada' };
  }

  // Historial de cambios de las propiedades de un corredor
  async historialPorCorredor(corredor_id: string) {
    return this.historialRepository.find({
      where: { corredor_id },
      order: { created_at: 'DESC' },
      take: 100,
    });
  }
}