import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export enum TipoNotificacion {
  RECORDATORIO_VISITA = 'recordatorio_visita',
  PAGO_VENCIDO = 'pago_vencido',
  PAGO_PROXIMO = 'pago_proximo',
  NUEVA_PROPIEDAD = 'nueva_propiedad',
  NUEVO_LEAD = 'nuevo_lead',
  CONFIRMACION_REGISTRO = 'confirmacion_registro',
  RESETEO_CONTRASENA = 'reseteo_contrasena',
  VISITANTE_CONFIRMADO = 'visitante_confirmado',
  PROPIEDAD_DISPONIBLE = 'propiedad_disponible',
  CONTACTO_CLIENTE = 'contacto_cliente',
}

interface TemplateNotificacion {
  asunto: string;
  contenido: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  // Templates por tipo de notificación
  private templates: Record<TipoNotificacion, TemplateNotificacion> = {
    [TipoNotificacion.RECORDATORIO_VISITA]: {
      asunto: 'Recordatorio: Visita programada para {{propiedad}} - {{fecha}}',
      contenido: `
        <h2>Recordatorio de Visita</h2>
        <p>Hola {{nombre}},</p>
        <p>Te recordamos que tienes una visita programada:</p>
        <ul>
          <li><strong>Propiedad:</strong> {{propiedad}}</li>
          <li><strong>Fecha:</strong> {{fecha}}</li>
          <li><strong>Hora:</strong> {{hora}}</li>
          <li><strong>Ubicación:</strong> {{ubicacion}}</li>
        </ul>
        <p>Si tienes dudas, contáctanos.</p>
      `,
    },
    [TipoNotificacion.PAGO_VENCIDO]: {
      asunto: '⚠️ Pago Vencido - Cuota #{{numero_cuota}} - {{monto}}',
      contenido: `
        <h2>Notificación de Pago Vencido</h2>
        <p>Hola {{nombre}},</p>
        <p>Te informamos que tu pago se encuentra vencido:</p>
        <ul>
          <li><strong>Cuota #:</strong> {{numero_cuota}}</li>
          <li><strong>Monto:</strong> {{monto}}</li>
          <li><strong>Fecha de Vencimiento:</strong> {{fecha_vencimiento}}</li>
          <li><strong>Propiedad:</strong> {{propiedad}}</li>
        </ul>
        <p><strong style="color: red;">Por favor, realiza el pago lo antes posible.</strong></p>
      `,
    },
    [TipoNotificacion.PAGO_PROXIMO]: {
      asunto: '📅 Próximo Pago Vence el {{fecha}} - {{monto}}',
      contenido: `
        <h2>Aviso de Próximo Pago</h2>
        <p>Hola {{nombre}},</p>
        <p>Te recordamos que tu próximo pago vence pronto:</p>
        <ul>
          <li><strong>Cuota #:</strong> {{numero_cuota}}</li>
          <li><strong>Monto:</strong> {{monto}}</li>
          <li><strong>Fecha de Vencimiento:</strong> {{fecha}}</li>
          <li><strong>Propiedad:</strong> {{propiedad}}</li>
        </ul>
        <p>Asegúrate de realizar el pago a tiempo.</p>
      `,
    },
    [TipoNotificacion.NUEVA_PROPIEDAD]: {
      asunto: '🏠 Nueva Propiedad Disponible: {{titulo}}',
      contenido: `
        <h2>Nueva Propiedad Disponible</h2>
        <p>Hola {{nombre}},</p>
        <p>Tenemos una nueva propiedad que podría interesarte:</p>
        <ul>
          <li><strong>Título:</strong> {{titulo}}</li>
          <li><strong>Ubicación:</strong> {{ubicacion}}</li>
          <li><strong>Precio:</strong> {{precio}}</li>
          <li><strong>Descripción:</strong> {{descripcion}}</li>
        </ul>
        <p>Contáctanos para más información.</p>
      `,
    },
    [TipoNotificacion.NUEVO_LEAD]: {
      asunto: '✨ Nuevo Lead: {{nombre_cliente}}',
      contenido: `
        <h2>Nuevo Lead Asignado</h2>
        <p>Hola {{nombre}},</p>
        <p>Se ha asignado un nuevo lead a tu cartera:</p>
        <ul>
          <li><strong>Cliente:</strong> {{nombre_cliente}}</li>
          <li><strong>Contacto:</strong> {{contacto}}</li>
          <li><strong>Interés:</strong> {{tipo_interes}}</li>
          <li><strong>Fecha de Creación:</strong> {{fecha_creacion}}</li>
        </ul>
        <p>Ponte en contacto con el cliente pronto.</p>
      `,
    },
    [TipoNotificacion.CONFIRMACION_REGISTRO]: {
      asunto: '✅ Cuenta Registrada Exitosamente',
      contenido: `
        <h2>Bienvenido {{nombre}}</h2>
        <p>Tu cuenta ha sido registrada exitosamente.</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Rol:</strong> {{rol}}</p>
        <p>Ya puedes iniciar sesión y comenzar a usar la plataforma.</p>
      `,
    },
    [TipoNotificacion.RESETEO_CONTRASENA]: {
      asunto: '🔐 Restablecer Contraseña',
      contenido: `
        <h2>Restablecer Contraseña</h2>
        <p>Hola {{nombre}},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="{{enlace_reset}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    },
    [TipoNotificacion.VISITANTE_CONFIRMADO]: {
      asunto: '✅ Visita Confirmada - {{propiedad}}',
      contenido: `
        <h2>Visita Confirmada</h2>
        <p>Hola {{nombre}},</p>
        <p>Tu visita ha sido confirmada:</p>
        <ul>
          <li><strong>Propiedad:</strong> {{propiedad}}</li>
          <li><strong>Fecha:</strong> {{fecha}}</li>
          <li><strong>Hora:</strong> {{hora}}</li>
          <li><strong>Corredor:</strong> {{corredor}}</li>
        </ul>
        <p>Te esperamos.</p>
      `,
    },
    [TipoNotificacion.PROPIEDAD_DISPONIBLE]: {
      asunto: '🎉 {{propiedad}} ya está disponible',
      contenido: `
        <h2>Propiedad Disponible</h2>
        <p>Hola {{nombre}},</p>
        <p><strong>{{propiedad}}</strong> que estabas buscando ahora está disponible.</p>
        <ul>
          <li><strong>Ubicación:</strong> {{ubicacion}}</li>
          <li><strong>Precio:</strong> {{precio}}</li>
        </ul>
        <p>¡No pierdas esta oportunidad!</p>
      `,
    },
    [TipoNotificacion.CONTACTO_CLIENTE]: {
      asunto: 'Hemos recibido tu mensaje',
      contenido: `
        <h2>Gracias por tu mensaje</h2>
        <p>Hola {{nombre}},</p>
        <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</p>
        <p><strong>Tu mensaje:</strong> {{mensaje}}</p>
        <p>Gracias por confiar en nosotros.</p>
      `,
    },
  };

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async enviarEmail(
    destinatario: string,
    asunto: string,
    contenido: string,
  ): Promise<any> {
    try {
      const resultado = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: destinatario,
        subject: asunto,
        html: contenido,
      });

      return resultado;
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw error;
    }
  }

  /**
   * Envía un correo reemplazando variables en una plantilla
   */
  async enviarEmailConPlantilla(
    destinatario: string,
    asunto: string,
    contenido: string,
    variables: Record<string, string>,
  ): Promise<any> {
    let asuntoFinal = asunto;
    let contenidoFinal = contenido;

    // Reemplazar cada variable en asunto y contenido
    Object.entries(variables).forEach(([clave, valor]) => {
      const regex = new RegExp(`{{${clave}}}`, 'g');
      asuntoFinal = asuntoFinal.replace(regex, valor);
      contenidoFinal = contenidoFinal.replace(regex, valor);
    });

    return this.enviarEmail(destinatario, asuntoFinal, contenidoFinal);
  }

  /**
   * Obtiene el template según el tipo de notificación
   */
  getTemplate(tipo: TipoNotificacion): TemplateNotificacion {
    return this.templates[tipo] || this.templates[TipoNotificacion.CONTACTO_CLIENTE];
  }

  /**
   * Envía correo con template predefinido
   */
  async enviarNotificacion(
    destinatario: string,
    tipo: TipoNotificacion,
    variables: Record<string, string>,
  ): Promise<any> {
    const template = this.getTemplate(tipo);
    return this.enviarEmailConPlantilla(
      destinatario,
      template.asunto,
      template.contenido,
      variables,
    );
  }
}
