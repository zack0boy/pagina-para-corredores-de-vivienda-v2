-- ============================================================
--  BASE DE DATOS COMPLETA - Inmuebles Chile (SaaS Corredores)
--  Generado automáticamente el 2026-07-09 desde PostgreSQL (Aiven)
--  Incluye: tipos ENUM, tablas, PK/FK/UNIQUE, índices y datos.
--  Ejecutar sobre una base vacía (esquema public).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── TIPOS ENUM ───
CREATE TYPE "estado_cliente" AS ENUM ('PENDIENTE_VALIDACION', 'ACTIVO', 'RECHAZADO', 'SUSPENDIDO');
CREATE TYPE "estado_comprobante" AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE "estado_contrato" AS ENUM ('BORRADOR', 'ACTIVO', 'FINALIZADO', 'CANCELADO');
CREATE TYPE "estado_correo" AS ENUM ('PENDIENTE', 'ENVIADO', 'ERROR');
CREATE TYPE "estado_cuota" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA');
CREATE TYPE "estado_empresa" AS ENUM ('ACTIVA', 'SUSPENDIDA');
CREATE TYPE "estado_lead" AS ENUM ('NUEVO', 'ASIGNADO', 'CONTACTADO', 'VISITA_PROGRAMADA', 'NEGOCIACION', 'CONVERTIDO', 'PERDIDO', 'REASIGNADO');
CREATE TYPE "estado_pago" AS ENUM ('PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO');
CREATE TYPE "estado_propiedad" AS ENUM ('DISPONIBLE', 'RESERVADA', 'VENDIDA', 'ARRENDADA', 'INACTIVA');
CREATE TYPE "estado_solicitud_cliente" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EXPIRADA');
CREATE TYPE "estado_visita" AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NO_ASISTIO');
CREATE TYPE "forma_pago_contrato" AS ENUM ('CUOTAS', 'PAGO_UNICO');
CREATE TYPE "rol_usuario" AS ENUM ('SUPER_ADMIN', 'ADMIN_EMPRESA', 'CORREDOR', 'CLIENTE');
CREATE TYPE "tipo_contrato" AS ENUM ('VENTA', 'ARRIENDO', 'RESERVA');
CREATE TYPE "tipo_evento" AS ENUM ('VISITA', 'CONTACTO_CLIENTE', 'GESTION_PAGO', 'OTRO', 'VENCIMIENTO_CUOTA');
CREATE TYPE "tipo_notificacion" AS ENUM ('LEAD', 'VISITA', 'CONTRATO', 'PAGO', 'SISTEMA', 'SOLICITUD');
CREATE TYPE "tipo_operacion" AS ENUM ('VENTA', 'ARRIENDO');
CREATE TYPE "tipo_pago" AS ENUM ('TRANSFERENCIA', 'PRESENCIAL');

-- ─── TABLAS ───
CREATE TABLE "categorias" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT,
  "activa" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "clientes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "apellido" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150),
  "telefono" VARCHAR(30) NOT NULL,
  "password_hash" TEXT,
  "google_id" VARCHAR(255),
  "activo" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "estado" "estado_cliente" NOT NULL DEFAULT 'PENDIENTE_VALIDACION'::estado_cliente,
  "email_verificado" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "comprobantes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "pago_id" UUID NOT NULL,
  "archivo_url" TEXT NOT NULL,
  "nombre_archivo" VARCHAR(255),
  "tipo_archivo" VARCHAR(50),
  "observaciones" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "estado" "estado_comprobante" NOT NULL DEFAULT 'pendiente'::estado_comprobante,
  "public_id" TEXT,
  "validado_por" UUID,
  "fecha_validacion" TIMESTAMP
);

CREATE TABLE "configuracion_email" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "smtp_host" VARCHAR(255) NOT NULL,
  "smtp_port" INTEGER NOT NULL,
  "smtp_user" VARCHAR(255) NOT NULL,
  "smtp_password" TEXT NOT NULL,
  "from_email" VARCHAR(255) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "contratos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "propiedad_id" UUID NOT NULL,
  "cliente_id" UUID NOT NULL,
  "corredor_id" UUID NOT NULL,
  "numero_contrato" VARCHAR(100) NOT NULL,
  "tipo" "tipo_contrato" NOT NULL,
  "monto_total" NUMERIC(15,2) NOT NULL,
  "fecha_inicio" DATE NOT NULL,
  "fecha_fin" DATE,
  "contrato_url" TEXT,
  "estado" "estado_contrato" NOT NULL DEFAULT 'BORRADOR'::estado_contrato,
  "observaciones" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "public_id" TEXT,
  "forma_pago" "forma_pago_contrato" NOT NULL DEFAULT 'PAGO_UNICO'::forma_pago_contrato,
  "monto_cuota_mensual" NUMERIC(15,2),
  "dia_pago_mensual" SMALLINT
);

CREATE TABLE "corredor" (
  "id_usuario" UUID NOT NULL,
  "licencia_profesional" VARCHAR(50),
  "descripcion" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "correos_enviados" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "plantilla_id" UUID,
  "destinatario" VARCHAR(255) NOT NULL,
  "asunto" VARCHAR(255) NOT NULL,
  "contenido" TEXT NOT NULL,
  "estado" "estado_correo" NOT NULL DEFAULT 'PENDIENTE'::estado_correo,
  "mensaje_error" TEXT,
  "enviado_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "cuotas" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "contrato_id" UUID NOT NULL,
  "numero_cuota" INTEGER NOT NULL,
  "monto_total" NUMERIC(15,2) NOT NULL,
  "monto_pagado" NUMERIC(15,2) NOT NULL DEFAULT 0,
  "saldo_pendiente" NUMERIC(15,2) NOT NULL,
  "fecha_vencimiento" DATE NOT NULL,
  "fecha_pago" DATE,
  "estado" "estado_cuota" NOT NULL DEFAULT 'PENDIENTE'::estado_cuota,
  "observaciones" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "email_verifications" (
  "id" INTEGER NOT NULL DEFAULT nextval('email_verifications_id_seq'::regclass),
  "email" VARCHAR(255) NOT NULL,
  "token" VARCHAR(10) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "empresa_redes_sociales" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "facebook_url" TEXT,
  "instagram_url" TEXT,
  "tiktok_url" TEXT,
  "linkedin_url" TEXT,
  "website_url" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "empresas" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nombre" VARCHAR(150) NOT NULL,
  "rut" VARCHAR(20),
  "email" VARCHAR(150),
  "telefono" VARCHAR(30),
  "direccion" TEXT,
  "logo_url" TEXT,
  "plan" VARCHAR(50) DEFAULT 'BASICO'::character varying,
  "fecha_vencimiento" DATE,
  "estado" "estado_empresa" NOT NULL DEFAULT 'ACTIVA'::estado_empresa,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "eventos_calendario" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "corredor_id" UUID NOT NULL,
  "cliente_id" UUID,
  "visita_id" UUID,
  "tipo" "tipo_evento" NOT NULL,
  "titulo" VARCHAR(150) NOT NULL,
  "descripcion" TEXT,
  "fecha_inicio" TIMESTAMP NOT NULL,
  "fecha_fin" TIMESTAMP NOT NULL,
  "completado" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "google_event_id" TEXT,
  "contrato_id" UUID,
  "cuota_id" UUID
);

CREATE TABLE "favoritos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cliente_id" UUID NOT NULL,
  "propiedad_id" UUID NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "historial_cambios" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID,
  "usuario_id" UUID,
  "tabla_afectada" VARCHAR(100) NOT NULL,
  "registro_id" UUID NOT NULL,
  "accion" VARCHAR(50) NOT NULL,
  "valor_anterior" JSONB,
  "valor_nuevo" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "historial_propiedad" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "propiedad_id" UUID,
  "corredor_id" UUID,
  "accion" VARCHAR(50) NOT NULL,
  "detalle" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "lead_asignaciones" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "lead_id" UUID NOT NULL,
  "corredor_anterior" UUID,
  "corredor_nuevo" UUID NOT NULL,
  "asignado_por" UUID NOT NULL,
  "motivo" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "leads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "propiedad_id" UUID NOT NULL,
  "cliente_id" UUID,
  "corredor_id" UUID,
  "nombre" VARCHAR(150) NOT NULL,
  "telefono" VARCHAR(30) NOT NULL,
  "email" VARCHAR(150),
  "mensaje" TEXT,
  "estado" "estado_lead" NOT NULL DEFAULT 'NUEVO'::estado_lead,
  "fecha_asignacion" TIMESTAMP,
  "ultimo_contacto" TIMESTAMP,
  "observaciones" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notificaciones" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "tipo" "tipo_notificacion" NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "mensaje" TEXT NOT NULL,
  "leida" BOOLEAN NOT NULL DEFAULT false,
  "fecha_lectura" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "pagos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cuota_id" UUID,
  "cliente_id" UUID,
  "monto" NUMERIC(15,2) NOT NULL,
  "fecha_pago" TIMESTAMP NOT NULL,
  "estado" "estado_pago" NOT NULL DEFAULT 'PENDIENTE_VALIDACION'::estado_pago,
  "comentario" TEXT,
  "validado_por" UUID,
  "fecha_validacion" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "tipo_pago" "tipo_pago" NOT NULL DEFAULT 'TRANSFERENCIA'::tipo_pago,
  "cliente_nombre" TEXT,
  "corredor_id" UUID,
  "propiedad_id" UUID,
  "propiedad_titulo" TEXT,
  "empresa_id" UUID
);

CREATE TABLE "password_resets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(150) NOT NULL,
  "token" VARCHAR(6) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "plantillas_email" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "nombre" VARCHAR(150) NOT NULL,
  "asunto" VARCHAR(255) NOT NULL,
  "contenido" TEXT NOT NULL,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "propiedad_imagenes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "propiedad_id" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "orden" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "public_id" VARCHAR(255)
);

CREATE TABLE "propiedades" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "corredor_id" UUID,
  "categoria_id" UUID NOT NULL,
  "codigo" VARCHAR(50) NOT NULL,
  "titulo" VARCHAR(100) NOT NULL,
  "descripcion" TEXT,
  "direccion" TEXT NOT NULL,
  "latitud" NUMERIC(10,8),
  "longitud" NUMERIC(11,8),
  "precio" NUMERIC(15,2) NOT NULL,
  "tipo_operacion" "tipo_operacion" NOT NULL,
  "estado" "estado_propiedad" NOT NULL DEFAULT 'DISPONIBLE'::estado_propiedad,
  "habitaciones" INTEGER DEFAULT 0,
  "banos" INTEGER DEFAULT 0,
  "estacionamientos" INTEGER DEFAULT 0,
  "metros_totales" NUMERIC(10,2),
  "metros_construidos" NUMERIC(10,2),
  "created_by" UUID,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "solicitudes_cliente" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "cliente_id" UUID NOT NULL,
  "corredor_id" UUID,
  "estado" "estado_solicitud_cliente" NOT NULL DEFAULT 'PENDIENTE'::estado_solicitud_cliente,
  "mensaje" TEXT,
  "motivo_rechazo" TEXT,
  "fecha_expiracion" TIMESTAMP NOT NULL DEFAULT (now() + '24:00:00'::interval),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "solicitudes_propiedad" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID,
  "solicitante_nombre" VARCHAR(255) NOT NULL,
  "solicitante_email" VARCHAR(255),
  "solicitante_telefono" VARCHAR(255),
  "titulo" VARCHAR(255) NOT NULL,
  "descripcion" TEXT,
  "direccion" VARCHAR(255) NOT NULL,
  "precio" NUMERIC(15,2) NOT NULL,
  "tipo_operacion" VARCHAR(50) DEFAULT 'VENTA'::character varying,
  "categoria_id" UUID,
  "estado" VARCHAR(50) DEFAULT 'PENDIENTE'::character varying,
  "corredor_id" UUID,
  "motivo_rechazo" TEXT,
  "propiedad_id" UUID,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "usuarios" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID,
  "nombre" VARCHAR(100) NOT NULL,
  "apellido" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) NOT NULL,
  "telefono" VARCHAR(30),
  "password_hash" TEXT NOT NULL,
  "google_id" VARCHAR(255),
  "rol" "rol_usuario" NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "ultimo_acceso" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "visitas" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" UUID NOT NULL,
  "lead_id" UUID,
  "propiedad_id" UUID NOT NULL,
  "cliente_id" UUID NOT NULL,
  "corredor_id" UUID NOT NULL,
  "fecha_inicio" TIMESTAMP NOT NULL,
  "fecha_fin" TIMESTAMP NOT NULL,
  "estado" "estado_visita" NOT NULL DEFAULT 'PROGRAMADA'::estado_visita,
  "google_event_id" VARCHAR(255),
  "observaciones" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── RESTRICCIONES (PK / UNIQUE / FK / CHECK) ───
ALTER TABLE categorias ADD CONSTRAINT "categorias_pkey" PRIMARY KEY (id);
ALTER TABLE clientes ADD CONSTRAINT "clientes_pkey" PRIMARY KEY (id);
ALTER TABLE comprobantes ADD CONSTRAINT "comprobantes_pkey" PRIMARY KEY (id);
ALTER TABLE configuracion_email ADD CONSTRAINT "configuracion_email_pkey" PRIMARY KEY (id);
ALTER TABLE contratos ADD CONSTRAINT "contratos_pkey" PRIMARY KEY (id);
ALTER TABLE corredor ADD CONSTRAINT "corredor_pkey" PRIMARY KEY (id_usuario);
ALTER TABLE correos_enviados ADD CONSTRAINT "correos_enviados_pkey" PRIMARY KEY (id);
ALTER TABLE cuotas ADD CONSTRAINT "cuotas_pkey" PRIMARY KEY (id);
ALTER TABLE email_verifications ADD CONSTRAINT "email_verifications_pkey" PRIMARY KEY (id);
ALTER TABLE empresa_redes_sociales ADD CONSTRAINT "empresa_redes_sociales_pkey" PRIMARY KEY (id);
ALTER TABLE empresas ADD CONSTRAINT "empresas_pkey" PRIMARY KEY (id);
ALTER TABLE eventos_calendario ADD CONSTRAINT "eventos_calendario_pkey" PRIMARY KEY (id);
ALTER TABLE favoritos ADD CONSTRAINT "favoritos_pkey" PRIMARY KEY (id);
ALTER TABLE historial_cambios ADD CONSTRAINT "historial_cambios_pkey" PRIMARY KEY (id);
ALTER TABLE historial_propiedad ADD CONSTRAINT "historial_propiedad_pkey" PRIMARY KEY (id);
ALTER TABLE lead_asignaciones ADD CONSTRAINT "lead_asignaciones_pkey" PRIMARY KEY (id);
ALTER TABLE leads ADD CONSTRAINT "leads_pkey" PRIMARY KEY (id);
ALTER TABLE notificaciones ADD CONSTRAINT "notificaciones_pkey" PRIMARY KEY (id);
ALTER TABLE pagos ADD CONSTRAINT "pagos_pkey" PRIMARY KEY (id);
ALTER TABLE password_resets ADD CONSTRAINT "password_resets_pkey" PRIMARY KEY (id);
ALTER TABLE plantillas_email ADD CONSTRAINT "plantillas_email_pkey" PRIMARY KEY (id);
ALTER TABLE propiedades ADD CONSTRAINT "propiedades_pkey" PRIMARY KEY (id);
ALTER TABLE propiedad_imagenes ADD CONSTRAINT "propiedad_imagenes_pkey" PRIMARY KEY (id);
ALTER TABLE solicitudes_cliente ADD CONSTRAINT "solicitudes_cliente_pkey" PRIMARY KEY (id);
ALTER TABLE solicitudes_propiedad ADD CONSTRAINT "solicitudes_propiedad_pkey" PRIMARY KEY (id);
ALTER TABLE usuarios ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY (id);
ALTER TABLE visitas ADD CONSTRAINT "visitas_pkey" PRIMARY KEY (id);
ALTER TABLE clientes ADD CONSTRAINT "clientes_email_key" UNIQUE (email);
ALTER TABLE configuracion_email ADD CONSTRAINT "configuracion_email_empresa_id_key" UNIQUE (empresa_id);
ALTER TABLE contratos ADD CONSTRAINT "contratos_numero_contrato_key" UNIQUE (numero_contrato);
ALTER TABLE cuotas ADD CONSTRAINT "uq_contrato_numero_cuota" UNIQUE (contrato_id, numero_cuota);
ALTER TABLE empresa_redes_sociales ADD CONSTRAINT "empresa_redes_sociales_empresa_id_key" UNIQUE (empresa_id);
ALTER TABLE favoritos ADD CONSTRAINT "uq_favorito_cliente_propiedad" UNIQUE (cliente_id, propiedad_id);
ALTER TABLE propiedades ADD CONSTRAINT "propiedades_codigo_key" UNIQUE (codigo);
ALTER TABLE usuarios ADD CONSTRAINT "usuarios_email_key" UNIQUE (email);
ALTER TABLE categorias ADD CONSTRAINT "fk_categoria_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE clientes ADD CONSTRAINT "fk_cliente_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE comprobantes ADD CONSTRAINT "fk_comprobante_pago" FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE CASCADE;
ALTER TABLE configuracion_email ADD CONSTRAINT "fk_config_email_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE contratos ADD CONSTRAINT "fk_contrato_propiedad" FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE RESTRICT;
ALTER TABLE contratos ADD CONSTRAINT "fk_contrato_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE RESTRICT;
ALTER TABLE contratos ADD CONSTRAINT "fk_contrato_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE contratos ADD CONSTRAINT "fk_contrato_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT;
ALTER TABLE correos_enviados ADD CONSTRAINT "fk_correo_plantilla" FOREIGN KEY (plantilla_id) REFERENCES plantillas_email(id) ON DELETE SET NULL;
ALTER TABLE correos_enviados ADD CONSTRAINT "fk_correo_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE cuotas ADD CONSTRAINT "fk_cuota_contrato" FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE;
ALTER TABLE empresa_redes_sociales ADD CONSTRAINT "fk_red_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE eventos_calendario ADD CONSTRAINT "fk_evento_visita" FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE SET NULL;
ALTER TABLE eventos_calendario ADD CONSTRAINT "fk_evento_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE eventos_calendario ADD CONSTRAINT "fk_evento_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE eventos_calendario ADD CONSTRAINT "fk_evento_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE favoritos ADD CONSTRAINT "fk_favorito_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
ALTER TABLE favoritos ADD CONSTRAINT "fk_favorito_propiedad" FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE;
ALTER TABLE historial_cambios ADD CONSTRAINT "fk_historial_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;
ALTER TABLE historial_cambios ADD CONSTRAINT "fk_historial_usuario" FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE lead_asignaciones ADD CONSTRAINT "fk_asig_usuario" FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT;
ALTER TABLE lead_asignaciones ADD CONSTRAINT "fk_asig_corredor_nuevo" FOREIGN KEY (corredor_nuevo) REFERENCES usuarios(id) ON DELETE RESTRICT;
ALTER TABLE lead_asignaciones ADD CONSTRAINT "fk_asig_corredor_anterior" FOREIGN KEY (corredor_anterior) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE lead_asignaciones ADD CONSTRAINT "fk_asig_lead" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
ALTER TABLE leads ADD CONSTRAINT "fk_lead_propiedad" FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE;
ALTER TABLE leads ADD CONSTRAINT "fk_lead_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE leads ADD CONSTRAINT "fk_lead_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE leads ADD CONSTRAINT "fk_lead_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE notificaciones ADD CONSTRAINT "fk_notificacion_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE notificaciones ADD CONSTRAINT "fk_notificacion_usuario" FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE pagos ADD CONSTRAINT "fk_pago_validado_por" FOREIGN KEY (validado_por) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE pagos ADD CONSTRAINT "fk_pago_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT;
ALTER TABLE pagos ADD CONSTRAINT "fk_pago_cuota" FOREIGN KEY (cuota_id) REFERENCES cuotas(id) ON DELETE CASCADE;
ALTER TABLE plantillas_email ADD CONSTRAINT "fk_plantilla_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE propiedades ADD CONSTRAINT "fk_prop_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE propiedades ADD CONSTRAINT "fk_prop_created_by" FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE propiedades ADD CONSTRAINT "fk_prop_categoria" FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT;
ALTER TABLE propiedades ADD CONSTRAINT "fk_prop_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE propiedad_imagenes ADD CONSTRAINT "fk_img_propiedad" FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE;
ALTER TABLE solicitudes_cliente ADD CONSTRAINT "fk_sol_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE solicitudes_cliente ADD CONSTRAINT "fk_sol_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
ALTER TABLE solicitudes_cliente ADD CONSTRAINT "fk_sol_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE usuarios ADD CONSTRAINT "fk_usuario_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;
ALTER TABLE visitas ADD CONSTRAINT "fk_visita_lead" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE visitas ADD CONSTRAINT "fk_visita_propiedad" FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE;
ALTER TABLE visitas ADD CONSTRAINT "fk_visita_empresa" FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
ALTER TABLE visitas ADD CONSTRAINT "fk_visita_corredor" FOREIGN KEY (corredor_id) REFERENCES usuarios(id) ON DELETE RESTRICT;
ALTER TABLE visitas ADD CONSTRAINT "fk_visita_cliente" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;

-- ─── ÍNDICES ───
CREATE INDEX idx_clientes_empresa ON public.clientes USING btree (empresa_id);
CREATE INDEX idx_comprobantes_pago ON public.comprobantes USING btree (pago_id);
CREATE INDEX idx_contratos_cliente ON public.contratos USING btree (cliente_id);
CREATE INDEX idx_contratos_corredor ON public.contratos USING btree (corredor_id);
CREATE INDEX idx_contratos_empresa ON public.contratos USING btree (empresa_id);
CREATE INDEX idx_contratos_estado ON public.contratos USING btree (estado);
CREATE INDEX idx_contratos_propiedad ON public.contratos USING btree (propiedad_id);
CREATE INDEX idx_contratos_tipo ON public.contratos USING btree (tipo);
CREATE INDEX idx_correos_destinatario ON public.correos_enviados USING btree (destinatario);
CREATE INDEX idx_correos_empresa ON public.correos_enviados USING btree (empresa_id);
CREATE INDEX idx_correos_estado ON public.correos_enviados USING btree (estado);
CREATE INDEX idx_cuotas_contrato ON public.cuotas USING btree (contrato_id);
CREATE INDEX idx_cuotas_estado ON public.cuotas USING btree (estado);
CREATE INDEX idx_cuotas_vencimiento ON public.cuotas USING btree (fecha_vencimiento);
CREATE INDEX idx_eventos_calendario_contrato_id ON public.eventos_calendario USING btree (contrato_id);
CREATE INDEX idx_eventos_calendario_cuota_id ON public.eventos_calendario USING btree (cuota_id);
CREATE INDEX idx_eventos_corredor ON public.eventos_calendario USING btree (corredor_id);
CREATE INDEX idx_eventos_empresa ON public.eventos_calendario USING btree (empresa_id);
CREATE INDEX idx_eventos_fecha ON public.eventos_calendario USING btree (fecha_inicio);
CREATE INDEX idx_eventos_tipo ON public.eventos_calendario USING btree (tipo);
CREATE INDEX idx_favoritos_cliente ON public.favoritos USING btree (cliente_id);
CREATE INDEX idx_favoritos_propiedad ON public.favoritos USING btree (propiedad_id);
CREATE INDEX idx_historial_empresa ON public.historial_cambios USING btree (empresa_id);
CREATE INDEX idx_historial_registro ON public.historial_cambios USING btree (registro_id);
CREATE INDEX idx_historial_tabla ON public.historial_cambios USING btree (tabla_afectada);
CREATE INDEX idx_historial_usuario ON public.historial_cambios USING btree (usuario_id);
CREATE INDEX idx_asignaciones_corredor ON public.lead_asignaciones USING btree (corredor_nuevo);
CREATE INDEX idx_asignaciones_lead ON public.lead_asignaciones USING btree (lead_id);
CREATE INDEX idx_leads_cliente ON public.leads USING btree (cliente_id);
CREATE INDEX idx_leads_corredor ON public.leads USING btree (corredor_id);
CREATE INDEX idx_leads_empresa ON public.leads USING btree (empresa_id);
CREATE INDEX idx_leads_estado ON public.leads USING btree (estado);
CREATE INDEX idx_leads_propiedad ON public.leads USING btree (propiedad_id);
CREATE INDEX idx_notificaciones_empresa ON public.notificaciones USING btree (empresa_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones USING btree (leida);
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones USING btree (usuario_id);
CREATE INDEX idx_pagos_cliente ON public.pagos USING btree (cliente_id);
CREATE INDEX idx_pagos_cuota ON public.pagos USING btree (cuota_id);
CREATE INDEX idx_pagos_empresa_id ON public.pagos USING btree (empresa_id);
CREATE INDEX idx_pagos_estado ON public.pagos USING btree (estado);
CREATE INDEX idx_password_resets_email ON public.password_resets USING btree (email);
CREATE INDEX idx_plantillas_empresa ON public.plantillas_email USING btree (empresa_id);
CREATE INDEX idx_propiedades_categoria ON public.propiedades USING btree (categoria_id);
CREATE INDEX idx_propiedades_corredor ON public.propiedades USING btree (corredor_id);
CREATE INDEX idx_propiedades_empresa ON public.propiedades USING btree (empresa_id);
CREATE INDEX idx_propiedades_estado ON public.propiedades USING btree (estado);
CREATE INDEX idx_propiedades_operacion ON public.propiedades USING btree (tipo_operacion);
CREATE INDEX idx_solicitudes_cliente_cliente ON public.solicitudes_cliente USING btree (cliente_id);
CREATE INDEX idx_solicitudes_cliente_corredor ON public.solicitudes_cliente USING btree (corredor_id);
CREATE INDEX idx_solicitudes_cliente_empresa ON public.solicitudes_cliente USING btree (empresa_id);
CREATE INDEX idx_solicitudes_cliente_estado ON public.solicitudes_cliente USING btree (estado);
CREATE INDEX idx_usuarios_empresa ON public.usuarios USING btree (empresa_id);
CREATE INDEX idx_visitas_cliente ON public.visitas USING btree (cliente_id);
CREATE INDEX idx_visitas_corredor ON public.visitas USING btree (corredor_id);
CREATE INDEX idx_visitas_empresa ON public.visitas USING btree (empresa_id);
CREATE INDEX idx_visitas_estado ON public.visitas USING btree (estado);
CREATE INDEX idx_visitas_fecha_inicio ON public.visitas USING btree (fecha_inicio);
CREATE INDEX idx_visitas_propiedad ON public.visitas USING btree (propiedad_id);

-- ─── DATOS ───
-- Datos de categorias (1 filas)
INSERT INTO "categorias" ("id", "empresa_id", "nombre", "descripcion", "activa", "created_at", "updated_at") VALUES ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Casas Residenciales', 'Categoría para pruebas de venta y arriendo de casas', true, '2026-06-09T11:42:32.410Z', '2026-06-09T11:42:32.410Z');

-- Datos de clientes (11 filas)
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('263e7885-aa2d-46ae-9523-d8e085b4fb4b', '00000000-0000-0000-0000-000000000001', 'francisco', 'perez', 'gonzaacastillo3@gmail.com', '+569 23459875', '$2b$10$71oYpHFSoJTsADli6I81Hu6X85469ObU3T4Tt4BMcrbawHz6QN9rC', NULL, true, '2026-07-03T00:58:58.909Z', '2026-07-03T00:58:58.909Z', 'PENDIENTE_VALIDACION', true);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('c1111111-b0a9-44d1-b1c2-0813066b1523', '00000000-0000-0000-0000-000000000001', 'Juanes', 'Perez', 'cliente1@inmuebles.com', '+56987654321', '$2b$10$7v27/4w.2.D6qO8U1XfJ1.iE2m6p4P66Gg5h4i3j2k1l0mNnOoPpQ', NULL, true, '2026-06-09T11:42:34.040Z', '2026-07-01T02:01:46.150Z', 'ACTIVO', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('94613df3-7435-49f2-b15f-781eb21928e3', '00000000-0000-0000-0000-000000000001', 'pedro', 'perez', 'pedro@test.gmail.com', '+569 12345678', '$2b$10$GOrVtzs3B4eX5bf8cpFShecmoGvNbOzfq0qd/4lAIvnzTiOxvr/ay', NULL, true, '2026-07-01T02:35:30.989Z', '2026-07-01T02:35:30.989Z', 'PENDIENTE_VALIDACION', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('b39c5ba7-d018-4eff-b047-e99a98a581df', '00000000-0000-0000-0000-000000000001', 'raton', 'perez', 'raton123@gmail.com', '+56923134563', '$2b$10$HdAf7MKWXfdwSoeFlR4rwe.pV4fe60/Rx.f11s2fzXlfl4TOF23QC', NULL, true, '2026-07-01T02:45:43.484Z', '2026-07-01T02:45:43.484Z', 'PENDIENTE_VALIDACION', true);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('e00d7a38-a2f5-4091-8d25-99a7f7abac4d', '00000000-0000-0000-0000-000000000001', 'rees', 'de carne', 'hwhegdhbdbdbdb@gmail.com', '+56912345678', '$2b$10$2bCrI0wyhwNliEaiFt8FbeMMzkI2e6ZPrEXCIleaEt3lleVWaX9VC', NULL, true, '2026-07-01T13:22:00.405Z', '2026-07-01T13:22:00.405Z', 'PENDIENTE_VALIDACION', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('0288243a-dcd7-4707-be10-9ab31dfded7c', '00000000-0000-0000-0000-000000000001', 'sfsef', 'dada', 'basurav64@gmail.com', '+56912345678', '$2b$10$OHEWeUoNTj7YwtRFDdtW2./cyIoTXQCYavJu1DA8VUETwJBqIJMCq', NULL, true, '2026-07-01T13:33:06.033Z', '2026-07-01T13:33:06.033Z', 'PENDIENTE_VALIDACION', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('411befe0-4175-45b1-8238-abdfbeb20bf8', '00000000-0000-0000-0000-000000000001', 'nick', 'asda', 'kiwilara62@gmail.com', '+56923134563', '$2b$10$ozFf4nsGkTq8QdO9d/R3ZehF3tGeUt3QuQcB8vPU.vuGfFYYNk9CS', NULL, true, '2026-07-01T13:45:20.123Z', '2026-07-01T13:45:20.123Z', 'PENDIENTE_VALIDACION', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('62edfd76-76c8-4069-9f7c-4797a4189b08', '00000000-0000-0000-0000-000000000001', 'olaff', 'yango', 'olafffyango@gmail.com', '+56923134563', '$2b$10$QQ.dPmOacz9KEbQDfAmuXeYSwauaNwmYf0nq02cUJ8aDKfUg0Pg7q', NULL, true, '2026-07-01T13:55:13.097Z', '2026-07-01T13:55:13.097Z', 'PENDIENTE_VALIDACION', true);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('c603b17a-0b5f-4374-8f82-f571411a06f9', '00000000-0000-0000-0000-000000000001', 'dxex', 'xdxe', 'castilllogonzalo85@gmail.com', '+56912345678', '$2b$10$MgqIpqC.IbstAqlVX1MQG.BTW7vNwX6Fg2DN3MdMwZy6baI7BDx0K', NULL, true, '2026-07-01T14:15:46.527Z', '2026-07-01T14:15:46.527Z', 'PENDIENTE_VALIDACION', false);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('4e265a04-e268-4dec-976a-6fec03d20544', '00000000-0000-0000-0000-000000000001', 'vgvv', 'ecec', 'basuras335@gmail.com', '+56912345678', '$2b$10$Wz3WWUGr/enosB6cpbOKsuN2gUEG4Lmi9RXKH5pdfWzdjspOCsitO', NULL, true, '2026-07-01T14:32:15.721Z', '2026-07-01T16:45:40.616Z', 'PENDIENTE_VALIDACION', true);
INSERT INTO "clientes" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "activo", "created_at", "updated_at", "estado", "email_verificado") VALUES ('289e5249-eff7-41e6-91f0-da13e276efc0', '00000000-0000-0000-0000-000000000001', 'juan', 'garp', 'npro0330@gmail.com', '+5692313456313123', '$2b$10$WFs5lRfIPH/Qa3Ttf2YTzuU2Xpka4ZdtfUpP2pakY3UooPsFAGs4W', NULL, true, '2026-06-19T08:24:43.924Z', '2026-07-02T08:46:19.561Z', 'PENDIENTE_VALIDACION', true);

-- Datos de comprobantes (6 filas)
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('4c8e696e-da3f-4eee-a778-2d93ed026899', '00000000-0000-0000-0000-000000000007', 'https://storage.s3.com/comprobantes/transf_11823.pdf', 'transf_11823.pdf', 'application/pdf', NULL, '2026-06-09T11:46:27.718Z', 'pendiente', NULL, NULL, NULL);
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('05d30d89-f1f9-4cd8-842f-e57ef916dd1d', '05db37c6-070f-454f-a202-fc32cfd506fe', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782553349/comprobantes/iuinawptxeexeijrnhsd.jpg', 'ai-generated-a-raccoon-wearing-green-sunglasses-making-a-hand-gesture-free-photo.jpg', 'image/jpeg', NULL, '2026-06-27T13:42:30.605Z', 'pendiente', NULL, NULL, NULL);
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('62fbf3a1-ac3a-4d16-9767-055027dede2e', '05db37c6-070f-454f-a202-fc32cfd506fe', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782897174/comprobantes/kk8dx3nfkwh15jtzu6or.jpg', 'images.jpg', 'image/jpeg', NULL, '2026-07-01T13:12:56.052Z', 'pendiente', NULL, NULL, NULL);
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('0ca83bc2-8db5-4262-b25d-64a3ebaf88ac', 'eff0d71f-ae21-4d20-bf3d-1786fa7d65b5', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782957744/comprobantes/wcizdl9kykmgrzruyfn8.jpg', 'images.jpg', 'image/jpeg', NULL, '2026-07-02T06:02:24.766Z', 'pendiente', NULL, NULL, NULL);
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('af2fbabe-ed98-450d-a982-790f3bb9a49f', '9243f16a-48d8-4440-b4f0-26df1b482771', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1783027744/comprobantes/slwubxozhnstd9pd1hjj.jpg', 'dasdadimages.jpg', 'image/jpeg', NULL, '2026-07-03T01:29:05.183Z', 'pendiente', NULL, NULL, NULL);
INSERT INTO "comprobantes" ("id", "pago_id", "archivo_url", "nombre_archivo", "tipo_archivo", "observaciones", "created_at", "estado", "public_id", "validado_por", "fecha_validacion") VALUES ('cf7f8a4b-e8a8-4f20-91a9-983983015b39', '9243f16a-48d8-4440-b4f0-26df1b482771', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1783039401/comprobantes/etbzula8bbaxdrsstp5h.jpg', 'ai-generated-a-raccoon-wearing-green-sunglasses-making-a-hand-gesture-free-photo.jpg', 'image/jpeg', NULL, '2026-07-03T04:43:24.239Z', 'pendiente', NULL, NULL, NULL);

-- Datos de configuracion_email (1 filas)
INSERT INTO "configuracion_email" ("id", "empresa_id", "smtp_host", "smtp_port", "smtp_user", "smtp_password", "from_email", "activo", "created_at", "updated_at") VALUES ('83b7d1a5-7aaf-47e9-a61c-b2bf1743f8e3', '00000000-0000-0000-0000-000000000001', 'smtp.mailtrap.io', 2525, 'usuario_prueba', 'pass_prueba', 'no-reply@inmuebleschile.cl', true, '2026-06-09T11:46:29.454Z', '2026-06-09T11:46:29.454Z');

-- Datos de contratos (1 filas)
INSERT INTO "contratos" ("id", "empresa_id", "propiedad_id", "cliente_id", "corredor_id", "numero_contrato", "tipo", "monto_total", "fecha_inicio", "fecha_fin", "contrato_url", "estado", "observaciones", "created_at", "updated_at", "public_id", "forma_pago", "monto_cuota_mensual", "dia_pago_mensual") VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'c1111111-b0a9-44d1-b1c2-0813066b1523', '75d04e76-b0a9-44d1-b1c2-0813066b1523', 'CON-2026-001', 'ARRIENDO', '5400000.00', '2026-07-01T04:00:00.000Z', '2027-06-30T04:00:00.000Z', NULL, 'ACTIVO', 'Contrato estándar de 1 año forzoso con renovación automática.', '2026-06-09T11:46:25.262Z', '2026-06-09T11:46:25.262Z', NULL, 'PAGO_UNICO', NULL, NULL);

-- Datos de corredor (2 filas)
INSERT INTO "corredor" ("id_usuario", "licencia_profesional", "descripcion", "created_at") VALUES ('258f5487-9a83-4c75-871e-deebcbee8f8c', NULL, 'asd', '2026-07-01T13:02:16.671Z');
INSERT INTO "corredor" ("id_usuario", "licencia_profesional", "descripcion", "created_at") VALUES ('0491345a-226b-4046-99cf-9f448cfda599', '1234567-ab', 'gato ', '2026-06-27T14:03:21.167Z');

-- Datos de cuotas (2 filas)
INSERT INTO "cuotas" ("id", "contrato_id", "numero_cuota", "monto_total", "monto_pagado", "saldo_pendiente", "fecha_vencimiento", "fecha_pago", "estado", "observaciones", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 1, '450000.00', '450000.00', '0.00', '2026-06-25T04:00:00.000Z', NULL, 'PAGADA', NULL, '2026-06-09T11:46:26.123Z', '2026-06-09T11:46:26.123Z');
INSERT INTO "cuotas" ("id", "contrato_id", "numero_cuota", "monto_total", "monto_pagado", "saldo_pendiente", "fecha_vencimiento", "fecha_pago", "estado", "observaciones", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 2, '450000.00', '0.00', '450000.00', '2026-07-05T04:00:00.000Z', NULL, 'PENDIENTE', NULL, '2026-06-09T11:46:26.123Z', '2026-06-09T11:46:26.123Z');

-- Datos de email_verifications (9 filas)
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (5, 'clientetest@gmail.com', '673805', '2026-06-28T12:33:49.554Z', '2026-06-28T12:18:49.554Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (6, 'josetest@gmail.com', '184360', '2026-06-28T12:50:57.530Z', '2026-06-28T12:35:57.530Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (39, 'pedro@test.gmail.com', '958047', '2026-07-01T02:50:32.355Z', '2026-07-01T02:35:32.355Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (40, 'pedro@test.mail', '806732', '2026-07-01T02:55:14.838Z', '2026-07-01T02:40:14.838Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (41, 'locos@gmail.com', '177853', '2026-07-01T02:57:13.109Z', '2026-07-01T02:42:13.109Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (45, 'hwhegdhbdbdbdb@gmail.com', '825270', '2026-07-01T13:37:01.327Z', '2026-07-01T13:22:01.327Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (46, 'basurav64@gmail.com', '505948', '2026-07-01T13:48:06.834Z', '2026-07-01T13:33:06.834Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (47, 'kiwilara62@gmail.com', '763926', '2026-07-01T14:00:21.100Z', '2026-07-01T13:45:21.100Z');
INSERT INTO "email_verifications" ("id", "email", "token", "expires_at", "created_at") VALUES (49, 'castilllogonzalo85@gmail.com', '446114', '2026-07-01T14:30:47.448Z', '2026-07-01T14:15:47.448Z');

-- Datos de empresa_redes_sociales (1 filas)
INSERT INTO "empresa_redes_sociales" ("id", "empresa_id", "facebook_url", "instagram_url", "tiktok_url", "linkedin_url", "website_url", "created_at", "updated_at") VALUES ('f905d79b-2131-4b9b-8fdf-4dd9e110081f', '00000000-0000-0000-0000-000000000001', 'https://facebook.com/inmuebleschile', 'https://instagram.com/inmuebleschile', 'https://tiktok.com/@inmuebleschile', 'https://linkedin.com/company/inmuebleschile', 'https://www.inmuebleschile.cl', '2026-06-09T11:46:19.793Z', '2026-06-09T11:46:19.793Z');

-- Datos de empresas (1 filas)
INSERT INTO "empresas" ("id", "nombre", "rut", "email", "telefono", "direccion", "logo_url", "plan", "fecha_vencimiento", "estado", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000001', 'Inmuebles Chile SaaS', '11.111.111-1', 'contacto@inmuebleschile.cl', '+56912345678', 'Santiago, Chile', NULL, 'PREMIUM', NULL, 'ACTIVA', '2026-06-09T11:42:31.483Z', '2026-06-09T11:42:31.483Z');

-- Datos de eventos_calendario (3 filas)
INSERT INTO "eventos_calendario" ("id", "empresa_id", "corredor_id", "cliente_id", "visita_id", "tipo", "titulo", "descripcion", "fecha_inicio", "fecha_fin", "completado", "created_at", "google_event_id", "contrato_id", "cuota_id") VALUES ('171e9cf8-9016-4bc5-85a7-5ca78e56e9b3', '00000000-0000-0000-0000-000000000001', '6c59e4aa-612e-48c8-96bc-782332c011d0', NULL, NULL, 'CONTACTO_CLIENTE', 'visita del perro', 'asdasda', '2026-06-28T00:06:00.000Z', '2026-07-23T00:06:00.000Z', false, '2026-06-22T04:06:39.384Z', NULL, NULL, NULL);
INSERT INTO "eventos_calendario" ("id", "empresa_id", "corredor_id", "cliente_id", "visita_id", "tipo", "titulo", "descripcion", "fecha_inicio", "fecha_fin", "completado", "created_at", "google_event_id", "contrato_id", "cuota_id") VALUES ('f0077d5d-c9c3-4ea7-a0a2-2c4518dcef8f', '00000000-0000-0000-0000-000000000001', '6c59e4aa-612e-48c8-96bc-782332c011d0', NULL, NULL, 'CONTACTO_CLIENTE', 'visita del perro', 'asdasda', '2026-06-28T00:06:00.000Z', '2026-07-23T00:06:00.000Z', false, '2026-06-22T04:06:39.561Z', NULL, NULL, NULL);
INSERT INTO "eventos_calendario" ("id", "empresa_id", "corredor_id", "cliente_id", "visita_id", "tipo", "titulo", "descripcion", "fecha_inicio", "fecha_fin", "completado", "created_at", "google_event_id", "contrato_id", "cuota_id") VALUES ('26412338-52b6-4a6c-9151-625df21c607f', '00000000-0000-0000-0000-000000000001', '6c59e4aa-612e-48c8-96bc-782332c011d0', NULL, NULL, 'CONTACTO_CLIENTE', 'visita del perro', 'asdasda', '2026-06-28T00:06:00.000Z', '2026-07-23T00:06:00.000Z', false, '2026-06-22T04:06:39.635Z', NULL, NULL, NULL);

-- Datos de favoritos (1 filas)
INSERT INTO "favoritos" ("id", "cliente_id", "propiedad_id", "created_at") VALUES ('abc95128-159e-468f-844b-9a327462dd68', 'c1111111-b0a9-44d1-b1c2-0813066b1523', '00000000-0000-0000-0000-000000000002', '2026-06-09T11:46:22.497Z');

-- Datos de historial_cambios (1 filas)
INSERT INTO "historial_cambios" ("id", "empresa_id", "usuario_id", "tabla_afectada", "registro_id", "accion", "valor_anterior", "valor_nuevo", "created_at") VALUES ('d688e59b-f3c9-4478-af50-98d5685d1a7b', '00000000-0000-0000-0000-000000000001', '75d04e76-b0a9-44d1-b1c2-0813066b1523', 'propiedades', '00000000-0000-0000-0000-000000000002', 'CREATE', NULL, '{"precio":450000,"titulo":"Hermoso Departamento Vista Cordillera"}', '2026-06-09T11:46:30.764Z');

-- Datos de historial_propiedad (8 filas)
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('a8237c05-dbc5-4d44-86bf-43b8d316d988', 'c01597a7-f990-438e-b904-ac50ad761f4a', '0491345a-226b-4046-99cf-9f448cfda599', 'ESTADO_CAMBIADO', 'Estado: DISPONIBLE → RESERVADA.', '2026-06-28T09:49:36.471Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('d3e11800-cc22-4ab4-a40a-5fca681a6765', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', '0491345a-226b-4046-99cf-9f448cfda599', 'ACTUALIZADA', 'Se editaron los datos de "casa de vivienda".', '2026-06-28T09:50:47.111Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('5345ae24-bafa-4bdb-8903-62a00eb49e9c', '9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', '0491345a-226b-4046-99cf-9f448cfda599', 'CREADA', 'Propiedad "departamento lujos" publicada.', '2026-07-01T13:11:44.170Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('1696f0f7-ba5b-42d9-a389-f491f270a7a6', 'e286b030-c3ff-4063-9454-1a0eec1029a1', '0491345a-226b-4046-99cf-9f448cfda599', 'CREADA', 'Propiedad "CASA residencial muy bonita" publicada.', '2026-07-03T01:25:51.211Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('a224b18f-c768-4506-97c2-32d37fc82bfc', 'e286b030-c3ff-4063-9454-1a0eec1029a1', '0491345a-226b-4046-99cf-9f448cfda599', 'ACTUALIZADA', 'Se editaron los datos de "CASA residencial muy bonita".', '2026-07-03T01:26:58.994Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('0720484a-f68b-48e6-9d9a-3fe61da745f2', 'e286b030-c3ff-4063-9454-1a0eec1029a1', '0491345a-226b-4046-99cf-9f448cfda599', 'ELIMINADA', 'Propiedad "CASA residencial muy bonita" eliminada.', '2026-07-03T01:27:16.383Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('a01c2a85-2b6e-439f-a612-0c317bc82f30', '7d630996-6da0-4de0-93dc-0cbafda959af', '0491345a-226b-4046-99cf-9f448cfda599', 'CREADA', 'Propiedad "asdasdawdasd" publicada.', '2026-07-03T01:40:18.713Z');
INSERT INTO "historial_propiedad" ("id", "propiedad_id", "corredor_id", "accion", "detalle", "created_at") VALUES ('1ee870a1-4654-4245-90d9-2ab6cdc2fb18', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', '0491345a-226b-4046-99cf-9f448cfda599', 'ACTUALIZADA', 'Se editaron los datos de "casa de vivienda".', '2026-07-03T04:37:20.788Z');

-- Datos de leads (1 filas)
INSERT INTO "leads" ("id", "empresa_id", "propiedad_id", "cliente_id", "corredor_id", "nombre", "telefono", "email", "mensaje", "estado", "fecha_asignacion", "ultimo_contacto", "observaciones", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'c1111111-b0a9-44d1-b1c2-0813066b1523', '75d04e76-b0a9-44d1-b1c2-0813066b1523', 'Juan Perez', '+56987654321', 'cliente1@inmuebles.com', 'Hola, me interesa mucho arrendar este departamento. ¿Cuándo se puede ir a ver?', 'CONTACTADO', NULL, NULL, NULL, '2026-06-09T11:46:23.420Z', '2026-06-09T11:46:23.420Z');

-- Datos de notificaciones (1 filas)
INSERT INTO "notificaciones" ("id", "empresa_id", "usuario_id", "tipo", "titulo", "mensaje", "leida", "fecha_lectura", "created_at") VALUES ('5ccdc2ca-7d50-4c8f-a399-2782b729b515', '00000000-0000-0000-0000-000000000001', '75d04e76-b0a9-44d1-b1c2-0813066b1523', 'LEAD', 'Nuevo Lead Recibido', 'Juan Perez está interesado en la propiedad PROP-001.', false, NULL, '2026-06-09T11:46:28.689Z');

-- Datos de pagos (7 filas)
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'c1111111-b0a9-44d1-b1c2-0813066b1523', '450000.00', '2026-06-24T22:30:00.000Z', 'VALIDADO', 'Transferencia electrónica Banco Estado', '75d04e76-b0a9-44d1-b1c2-0813066b1523', '2026-06-25T13:00:00.000Z', '2026-06-09T11:46:26.796Z', 'TRANSFERENCIA', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('eff0d71f-ae21-4d20-bf3d-1786fa7d65b5', NULL, NULL, '12333.00', '2026-12-12T15:12:00.000Z', 'VALIDADO', 'asd', '258f5487-9a83-4c75-871e-deebcbee8f8c', '2026-07-02T06:31:50.120Z', '2026-07-02T06:02:20.977Z', 'TRANSFERENCIA', 'asd', '0491345a-226b-4046-99cf-9f448cfda599', NULL, 'dwad', NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('53e58c25-b772-4dd5-ac9a-3b8e21f26b76', NULL, '4e265a04-e268-4dec-976a-6fec03d20544', '123445.00', '2004-03-12T15:03:00.000Z', 'VALIDADO', NULL, '258f5487-9a83-4c75-871e-deebcbee8f8c', '2026-07-02T06:31:53.398Z', '2026-07-02T01:36:44.952Z', 'TRANSFERENCIA', 'asc', NULL, NULL, NULL, NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('a85a2f33-d824-469c-834a-d7e13c1b9869', NULL, '4e265a04-e268-4dec-976a-6fec03d20544', '223666.00', '2004-02-12T17:25:00.000Z', 'VALIDADO', NULL, '258f5487-9a83-4c75-871e-deebcbee8f8c', '2026-07-02T06:31:57.062Z', '2026-07-02T01:02:09.511Z', 'TRANSFERENCIA', 'vgvv', NULL, NULL, NULL, NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('0e9f2e14-958f-4897-9ffa-3356725bf187', NULL, NULL, '50000.00', '2026-06-27T09:45:36.000Z', 'VALIDADO', NULL, '258f5487-9a83-4c75-871e-deebcbee8f8c', '2026-07-02T06:32:00.359Z', '2026-06-27T13:45:37.764Z', 'TRANSFERENCIA', 'Prueba', '0491345a-226b-4046-99cf-9f448cfda599', 'c01597a7-f990-438e-b904-ac50ad761f4a', 'Departamento en Providencia', NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('05db37c6-070f-454f-a202-fc32cfd506fe', NULL, NULL, '4.00', '2026-06-27T09:42:00.000Z', 'VALIDADO', 'abono', '258f5487-9a83-4c75-871e-deebcbee8f8c', '2026-07-02T06:32:04.630Z', '2026-06-27T13:42:16.977Z', 'PRESENCIAL', 'asdasd', '0491345a-226b-4046-99cf-9f448cfda599', 'c01597a7-f990-438e-b904-ac50ad761f4a', 'Departamento en Providencia', NULL);
INSERT INTO "pagos" ("id", "cuota_id", "cliente_id", "monto", "fecha_pago", "estado", "comentario", "validado_por", "fecha_validacion", "created_at", "tipo_pago", "cliente_nombre", "corredor_id", "propiedad_id", "propiedad_titulo", "empresa_id") VALUES ('9243f16a-48d8-4440-b4f0-26df1b482771', NULL, NULL, '1500000.00', '2026-12-12T15:31:00.000Z', 'PENDIENTE_VALIDACION', 'el cliente pago', NULL, NULL, '2026-07-03T01:29:01.952Z', 'TRANSFERENCIA', 'francisco peres', '0491345a-226b-4046-99cf-9f448cfda599', NULL, 'casa residencial muy bonita', NULL);

-- Datos de plantillas_email (1 filas)
INSERT INTO "plantillas_email" ("id", "empresa_id", "nombre", "asunto", "contenido", "activa", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Bienvenida Lead', 'Gracias por contactarnos', 'Hola {{nombre}}, recibimos tu solicitud por la propiedad...', true, '2026-06-09T11:46:30.158Z', '2026-06-09T11:46:30.158Z');

-- Datos de propiedad_imagenes (9 filas)
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('0391768d-f513-4866-8549-d425a41856c0', '9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782897110/propiedades/areeh2shhysrwbpeedx1.jpg', 3, '2026-07-01T13:11:53.491Z', 'propiedades/areeh2shhysrwbpeedx1');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('66747e96-ce38-4920-900d-8bf57a54eb2c', '9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782897114/propiedades/wb1rmodsmz8hiqfet8vp.jpg', 4, '2026-07-01T13:11:55.128Z', 'propiedades/wb1rmodsmz8hiqfet8vp');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('8bc82194-fb66-493d-95f5-5e16fbc94b04', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782555286/propiedades/sumwfhcpfzqzqx5mznmr.webp', 2, '2026-06-27T14:14:46.659Z', 'propiedades/sumwfhcpfzqzqx5mznmr');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('a2c88653-5b6d-46a6-b999-ad31d0fb40ff', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782555556/propiedades/vgngzy5oa101peowucxm.jpg', 4, '2026-06-27T14:19:17.046Z', 'propiedades/vgngzy5oa101peowucxm');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('82676e20-a112-4967-81ba-a61d40de6e01', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782555284/propiedades/h9svmojnwusj0fa4gljr.jpg', 3, '2026-06-27T14:14:45.136Z', 'propiedades/h9svmojnwusj0fa4gljr');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('87820750-9037-4c1e-81cf-9272025b5b4d', '4e62f600-52a8-4f77-853c-e8a673ceb2ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782555283/propiedades/picqyzw8stabrifdwssz.jpg', 1, '2026-06-27T14:14:43.865Z', 'propiedades/picqyzw8stabrifdwssz');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('d6ac64fe-ff44-4fdd-a73b-5ecc1062a27d', '00000000-0000-0000-0000-000000000002', 'https://http2.mlstatic.com/D_NQ_NP_2X_953534-MLC100152476997_122025-F-condominio-altos-de-lircay.webp', 2, '2026-06-09T11:46:21.574Z', NULL);
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('d9f317ac-9d84-4dd4-9d2f-61fc2af079a5', '9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782897106/propiedades/q04vwf5wegaueh1frgjg.jpg', 1, '2026-07-01T13:11:47.246Z', 'propiedades/q04vwf5wegaueh1frgjg');
INSERT INTO "propiedad_imagenes" ("id", "propiedad_id", "url", "orden", "created_at", "public_id") VALUES ('5c969457-b1ac-4541-80d7-745b6f77c899', '9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', 'https://res.cloudinary.com/dd5amq7qs/image/upload/v1782897108/propiedades/byb6cwuokqblih1b36rt.jpg', 2, '2026-07-01T13:11:49.601Z', 'propiedades/byb6cwuokqblih1b36rt');

-- Datos de propiedades (6 filas)
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '75d04e76-b0a9-44d1-b1c2-0813066b1523', 'c0000000-0000-0000-0000-000000000001', 'PROP-001', 'Hermoso Departamento Vista Cordillera', 'Excelente conectividad, cercano a metros, comercios y áreas verdes. Piso flotante y terraza.', 'Av. Libertador Bernardo O’Higgins 1400, Santiago', '-35.41713500', '-71.65683500', '450000.00', 'ARRIENDO', 'DISPONIBLE', 2, 2, 1, '75.00', '70.00', '75d04e76-b0a9-44d1-b1c2-0813066b1523', '2026-06-09T11:46:20.447Z', '2026-06-09T11:46:20.447Z');
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('7d630996-6da0-4de0-93dc-0cbafda959af', '00000000-0000-0000-0000-000000000001', '0491345a-226b-4046-99cf-9f448cfda599', 'c0000000-0000-0000-0000-000000000001', 'PROP-Q3UQ3IYJD', 'asdasdawdasd', '', 'Padre Liam Holohan, Villa Sara Gajardo, Cerro Navia, Provincia de Santiago, Región Metropolitana de Santiago, 9100277, Chile', '-33.41520374', '-70.72394812', '1231231231.00', 'VENTA', 'DISPONIBLE', 12, 1, 12, '123.00', '123132.00', NULL, '2026-07-03T01:40:17.810Z', '2026-07-03T01:40:17.810Z');
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('4e62f600-52a8-4f77-853c-e8a673ceb2ee', '00000000-0000-0000-0000-000000000001', '0491345a-226b-4046-99cf-9f448cfda599', 'c0000000-0000-0000-0000-000000000001', 'PROP-AXXV2G1BH', 'casa de vivienda', 'es una propiedad muy bonit', '332, Cueto, Santiago, Provincia de Santiago, Región Metropolitana de Santiago, 8320000, Chile', '-33.44163402', '-70.67230041', '1213123123112.00', 'VENTA', 'DISPONIBLE', 2, 1, 1, '18.00', '12.00', NULL, '2026-06-27T14:14:41.952Z', '2026-07-03T04:37:20.507Z');
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('429807c9-44c9-489f-a430-721abf824a77', '00000000-0000-0000-0000-000000000001', '0491345a-226b-4046-99cf-9f448cfda599', 'c0000000-0000-0000-0000-000000000001', 'SOL-509456', 'Casa de prueba', NULL, 'Calle 123', NULL, NULL, '100000.00', 'VENTA', 'DISPONIBLE', 0, 0, 0, NULL, NULL, NULL, '2026-06-28T08:05:10.366Z', '2026-06-28T08:05:10.366Z');
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('c01597a7-f990-438e-b904-ac50ad761f4a', '00000000-0000-0000-0000-000000000001', '0491345a-226b-4046-99cf-9f448cfda599', 'c0000000-0000-0000-0000-000000000001', 'PROP-002', 'Departamento de prueba edicion ok', 'Hermoso departamento cercano al metro.', 'Av. Providencia 1234, Providencia', '-33.43720000', '-70.65060000', '145000000.00', 'VENTA', 'RESERVADA', 3, 2, 1, '95.50', '85.00', '0491345a-226b-4046-99cf-9f448cfda599', '2026-06-25T09:21:12.569Z', '2026-06-28T09:49:36.267Z');
INSERT INTO "propiedades" ("id", "empresa_id", "corredor_id", "categoria_id", "codigo", "titulo", "descripcion", "direccion", "latitud", "longitud", "precio", "tipo_operacion", "estado", "habitaciones", "banos", "estacionamientos", "metros_totales", "metros_construidos", "created_by", "created_at", "updated_at") VALUES ('9b7bbdb5-b0b9-4800-978f-169b3d59a1ee', '00000000-0000-0000-0000-000000000001', '0491345a-226b-4046-99cf-9f448cfda599', 'c0000000-0000-0000-0000-000000000001', 'PROP-6Q04YFGKN', 'departamento lujos', 'esta casa es muy lujosa', 'Edificio Uno Poniente, 140, 1 Poniente, Población Quinta Rioja, Población Vergara, Forestal, Viña del Mar, Provincia de Valparaíso, Región de Valparaíso, 2520314, Chile', '-33.02108758', '-71.55206680', '1234567.00', 'ARRIENDO', 'DISPONIBLE', 6, 5, 3, '120000.00', '6000.00', NULL, '2026-07-01T13:11:43.495Z', '2026-07-01T13:11:43.495Z');

-- Datos de solicitudes_propiedad (1 filas)
INSERT INTO "solicitudes_propiedad" ("id", "empresa_id", "solicitante_nombre", "solicitante_email", "solicitante_telefono", "titulo", "descripcion", "direccion", "precio", "tipo_operacion", "categoria_id", "estado", "corredor_id", "motivo_rechazo", "propiedad_id", "created_at") VALUES ('045df6d2-2d9c-454c-a056-3fed87a7fc3f', '00000000-0000-0000-0000-000000000001', 'Prueba', NULL, NULL, 'Casa de prueba', NULL, 'Calle 123', '100000.00', 'VENTA', NULL, 'APROBADA', '0491345a-226b-4046-99cf-9f448cfda599', NULL, '429807c9-44c9-489f-a430-721abf824a77', '2026-06-27T13:30:49.888Z');

-- Datos de usuarios (11 filas)
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('dcef6470-2287-4889-a775-d585faa3ce8f', NULL, 'Test User', '', 'usuario_test@gmail.com', NULL, '$2b$10$obehJhCqFYgv/dTkqE63sOv4n5ByQiQjiQb2bNlri4ONgSU1KKczi', NULL, 'CORREDOR', true, NULL, '2026-06-08T10:12:27.136Z', '2026-06-08T10:12:27.136Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('327b2754-ee3d-4476-8868-6b7119f2bb19', NULL, 'Test User', 'Testing', 'usuarios_test@gmail.com', NULL, '$2b$10$y5W7vyCuP78I/9.w8r9s1.a0snMWgxgq53lgxOnPFREiBLhpkjAaO', NULL, 'CORREDOR', true, NULL, '2026-06-09T03:21:47.507Z', '2026-06-09T03:21:47.507Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('b7510dae-ce26-4a7a-ada7-500e32f1c11b', NULL, 'Test User', 'Testing', 'usuarios_utest@gmail.com', NULL, '$2b$10$pTqHE/9pPhVaXU3xSeuWaO1bdNm4B0YwWyGcTRPoZpdczHCWtZQ5K', NULL, 'CORREDOR', true, NULL, '2026-06-09T11:15:47.865Z', '2026-06-09T11:15:47.865Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('6b73eef2-d60a-4e55-8b05-91b28fe50119', NULL, 'Andres Corredor', '', 'andres@inmuebleschile.cl', NULL, '$2b$10$1a3vsYhpjsTRGE5lpEO1De0QHQbuS3dMbPR87wbxz.rolVnbR5W7y', NULL, 'CLIENTE', true, NULL, '2026-06-09T12:03:08.528Z', '2026-06-09T12:03:08.528Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('58a469d3-2133-444b-9270-8a84c865ee5b', NULL, 'Nicolas play', '', 'Nicolas@inmueble.com', NULL, '$2b$10$cTJjrMmwuQDZspuC/qLDluJ64qSAAHbFNJdKAvX0kEYxo9DV0Gre.', NULL, 'CLIENTE', true, NULL, '2026-06-11T09:17:46.883Z', '2026-06-11T09:17:46.883Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('fd77d8c4-523c-4dd3-8bb9-0b56a879df18', NULL, 'patoconpan', '', 'patoconpan@gmail.com', NULL, '$2b$10$rj4kuZsfLQiT8.DzUkdLW.HOv7m8UE4tsegDJ66bSkkl6I6xKlfhC', NULL, 'CLIENTE', true, NULL, '2026-06-12T01:53:42.697Z', '2026-06-12T01:53:42.697Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('e1b85787-67d9-4dad-ac81-ec51c1899abe', NULL, 'Nicklix028', '', 'Nick@gmail.com', NULL, '$2b$10$hORfedujqZAKUdzVIKaRHO5yjGF0YjSQ6zBJED5Qj6M0RLZfbWtwK', NULL, 'SUPER_ADMIN', true, NULL, '2026-06-11T09:56:19.290Z', '2026-06-19T08:23:42.067Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('6c59e4aa-612e-48c8-96bc-782332c011d0', NULL, 'juan perez', '', 'juanperez@gmail.com', NULL, '$2b$10$eFZYmPGVPtMuCNITgZN5huTUa2YVCDns01ZiqyCrMuBl1zrJ5ofpi', NULL, 'CORREDOR', true, NULL, '2026-06-11T09:36:08.610Z', '2026-06-11T09:36:08.610Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('258f5487-9a83-4c75-871e-deebcbee8f8c', '00000000-0000-0000-0000-000000000001', 'pato', 'pedro', 'papo@gmail.com', '+56923134563', '$2b$10$wKIQuYmWI6J7TFPBLWsnnuJdf4etkee/dtZsadoCTDFGdDbdxT.5e', NULL, 'ADMIN_EMPRESA', true, NULL, '2026-07-01T13:02:15.648Z', '2026-07-02T10:01:23.439Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('0491345a-226b-4046-99cf-9f448cfda599', '00000000-0000-0000-0000-000000000001', 'felipe', '', 'felipe@test.com', NULL, '$2b$10$hpqn840m1fv51r6nKjIUOuUmidXZW8/FFDpw.8STp0.bagBTPtIRG', NULL, 'CORREDOR', true, NULL, '2026-06-18T18:10:21.213Z', '2026-07-03T01:34:32.034Z');
INSERT INTO "usuarios" ("id", "empresa_id", "nombre", "apellido", "email", "telefono", "password_hash", "google_id", "rol", "activo", "ultimo_acceso", "created_at", "updated_at") VALUES ('75d04e76-b0a9-44d1-b1c2-0813066b1523', '00000000-0000-0000-0000-000000000001', 'Andres', 'Diaz', 'andrediaz1234512345@gmail.com', '+569123123123123', 'LOGIN_EXCLUSIVO_GOOGLE_NO_PASSWORD', '117696779586194369969', 'SUPER_ADMIN', true, NULL, '2026-06-09T09:57:16.000Z', '2026-07-03T04:35:14.561Z');

-- Datos de visitas (1 filas)
INSERT INTO "visitas" ("id", "empresa_id", "lead_id", "propiedad_id", "cliente_id", "corredor_id", "fecha_inicio", "fecha_fin", "estado", "google_event_id", "observaciones", "created_at", "updated_at") VALUES ('312e7dc8-0644-4ecc-b6c4-4489dfc21815', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'c1111111-b0a9-44d1-b1c2-0813066b1523', '75d04e76-b0a9-44d1-b1c2-0813066b1523', '2026-06-15T14:00:00.000Z', '2026-06-15T15:00:00.000Z', 'PROGRAMADA', NULL, 'Llevar copias impresas de los requisitos de arriendo.', '2026-06-09T11:46:24.339Z', '2026-06-09T11:46:24.339Z');
