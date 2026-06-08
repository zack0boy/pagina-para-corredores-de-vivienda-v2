import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

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
}
