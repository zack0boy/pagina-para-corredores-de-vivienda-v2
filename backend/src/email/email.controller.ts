import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  async enviarTest() {
    await this.emailService.enviarEmail(
      'afasa030@gmail.com',
      'Correo de prueba desde NestJS',
      '<h1>Hola desde NestJS</h1><p>Este es un correo de prueba para verificar que el sistema SMTP está funcionando correctamente.</p>',
    );

    return {
      mensaje: 'Correo de prueba enviado correctamente',
      destinatario: 'afasa030@gmail.com',
    };
  }

  @Post('enviar')
  async enviarCorreo(
    @Body()
    body: {
      destinatario: string;
      asunto: string;
      contenido: string;
    },
  ) {
    await this.emailService.enviarEmail(
      body.destinatario,
      body.asunto,
      body.contenido,
    );

    return {
      mensaje: 'Correo enviado correctamente',
      destinatario: body.destinatario,
    };
  }

  @Post('plantilla')
  async enviarConPlantilla(
    @Body()
    body: {
      destinatario: string;
      asunto: string;
      contenido: string;
      variables: Record<string, string>;
    },
  ) {
    await this.emailService.enviarEmailConPlantilla(
      body.destinatario,
      body.asunto,
      body.contenido,
      body.variables,
    );

    return {
      mensaje: 'Correo con plantilla enviado correctamente',
      destinatario: body.destinatario,
    };
  }
}
