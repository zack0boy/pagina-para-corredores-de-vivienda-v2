import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { EmailService, TipoNotificacion } from '../email/email.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { EstadoCliente } from '../common/enum/estado.enum';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      console.warn('⚠️ GOOGLE_CLIENT_ID no está configurado en variables de entorno');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  // Registro exclusivo para clientes (crea en tabla 'clientes')
  async register(
    nombre: string,
    apellido: string,
    email: string,
    password: string,
    telefono: string,
    empresa_id: string,
  ) {
    const existente = await this.usersService.findClienteByEmail(email);
    if (existente) throw new ConflictException('El email ya está registrado');

    const cliente = await this.usersService.createCliente({
      empresa_id,
      nombre,
      apellido,
      email,
      telefono,
      password,
    });

    return {
      message: 'Cliente registrado correctamente. Pendiente de validación.',
      user: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        tipo: 'cliente',
        estado: cliente.estado,
      },
    };
  }

  // Login unificado: primero busca en usuarios (staff), luego en clientes
  async login(email: string, password: string) {
    // Intentar como staff primero
    const usuario = await this.usersService.findByEmail(email);
    if (usuario) {
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) throw new UnauthorizedException('Credenciales inválidas');

      const token = await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
        role: usuario.rol,
        tipo: 'staff',
      });

      return {
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          tipo: 'staff',
        },
      };
    }

    // Intentar como cliente
    const cliente = await this.usersService.findClienteByEmail(email);
    if (!cliente || !cliente.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const match = await bcrypt.compare(password, cliente.password);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    if (!cliente.activo) {
      throw new UnauthorizedException('Cuenta desactivada. Contacte a su corredor.');
    }

    const token = await this.jwtService.signAsync({
      sub: cliente.id,
      email: cliente.email,
      role: 'CLIENTE',
      tipo: 'cliente',
      empresa_id: cliente.empresa_id,
    });

    return {
      token,
      user: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        rol: 'CLIENTE',
        tipo: 'cliente',
        estado: cliente.estado,
        empresa_id: cliente.empresa_id,
      },
    };
  }

  // Google login para staff (busca en usuarios)
  async googleLogin(token: string) {
    try {
      console.log('====================');
      console.log('🔵 GOOGLE LOGIN INICIADO');
      console.log('====================');

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (!clientId) throw new BadRequestException('GOOGLE_CLIENT_ID no está configurado');
      if (!token || token.trim() === '') throw new BadRequestException('Token no proporcionado');

      const ticket = await this.googleClient.verifyIdToken({ idToken: token, audience: clientId });
      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new UnauthorizedException('Token Google inválido: no contiene email');
      }

      console.log('👤 Email:', payload.email);

      // Buscar primero en staff
      let usuario = await this.usersService.findByEmail(payload.email);
      if (usuario) {
        const jwtToken = await this.jwtService.signAsync({
          sub: usuario.id,
          email: usuario.email,
          role: usuario.rol,
          tipo: 'staff',
        });

        return {
          message: 'Login Google exitoso',
          token: jwtToken,
          user: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            tipo: 'staff',
          },
        };
      }

      // Buscar en clientes
      const cliente = await this.usersService.findClienteByEmail(payload.email);
      if (cliente) {
        const jwtToken = await this.jwtService.signAsync({
          sub: cliente.id,
          email: cliente.email,
          role: 'CLIENTE',
          tipo: 'cliente',
          empresa_id: cliente.empresa_id,
        });

        return {
          message: 'Login Google exitoso',
          token: jwtToken,
          user: {
            id: cliente.id,
            nombre: cliente.nombre,
            email: cliente.email,
            rol: 'CLIENTE',
            tipo: 'cliente',
            estado: cliente.estado,
            empresa_id: cliente.empresa_id,
          },
        };
      }

      // Usuario nuevo via Google: crear como staff CLIENTE (sin empresa aún)
      usuario = await this.usersService.createUsuario({
        nombre: payload.given_name ?? payload.name?.split(' ')[0] ?? '',
        apellido: payload.family_name ?? '',
        email: payload.email,
        password: 'GOOGLE_AUTH_NO_PASSWORD',
        googleId: payload.sub,
      });

      console.log('✅ Usuario staff creado via Google:', usuario.id);

      const jwtToken = await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
        role: usuario.rol,
        tipo: 'staff',
      });

      return {
        message: 'Login Google exitoso',
        token: jwtToken,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          tipo: 'staff',
        },
      };
    } catch (error: any) {
      console.error('❌ ERROR EN GOOGLE LOGIN:', error.message);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
      throw new UnauthorizedException(`Error autenticando con Google: ${error.message}`);
    }
  }

  async forgotPassword(email: string) {
    // Buscar en ambas tablas
    const usuario = await this.usersService.findByEmail(email);
    const cliente = await this.usersService.findClienteByEmail(email);

    if (!usuario && !cliente) {
      return { message: 'Si el correo existe, recibirá instrucciones' };
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await this.dataSource.query(
      `INSERT INTO password_resets (email, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [email, codigo],
    );

    const nombre = usuario?.nombre ?? cliente?.nombre ?? '';
    await this.emailService.enviarNotificacion(email, TipoNotificacion.RESETEO_CONTRASENA, {
      nombre,
      codigo,
    });

    return { message: 'Si el correo existe, recibirá instrucciones' };
  }

  async resetPassword(email: string, codigo: string, newPassword: string) {
    const resultado = await this.dataSource.query(
      `SELECT * FROM password_resets WHERE email = $1 AND token = $2 AND expires_at > NOW()`,
      [email, codigo],
    );

    if (!resultado || resultado.length === 0) {
      throw new BadRequestException('Código inválido o expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en la tabla correcta
    const usuario = await this.usersService.findByEmail(email);
    if (usuario) {
      await this.usersService.updatePassword(usuario.id, hashedPassword);
    } else {
      const cliente = await this.usersService.findClienteByEmail(email);
      if (cliente) {
        await this.dataSource.query(
          `UPDATE clientes SET password_hash = $1 WHERE id = $2`,
          [hashedPassword, cliente.id],
        );
      }
    }

    await this.dataSource.query(
      'DELETE FROM password_resets WHERE email = $1 AND token = $2',
      [email, codigo],
    );

    return { message: 'Contraseña actualizada correctamente' };
  }
}
