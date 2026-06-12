import {Injectable,UnauthorizedException,ConflictException,BadRequestException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enum/roles.enum';
import { DataSource } from 'typeorm';
import { EmailService, TipoNotificacion } from '../email/email.service';
import { InjectDataSource } from '@nestjs/typeorm';

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

  async register(
    nombre: string,
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        'El email ya está registrado',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const usuario =
      await this.usersService.createUsuario({
        nombre,
        apellido: '',
        email,
        password: hashedPassword,
        rol: RolUsuario.CLIENTE,
        activo: true,
      });

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const usuario =
      await this.usersService.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        usuario.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    const token =
      await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
        role: usuario.rol,
      });

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async googleLogin(token: string) {
    try {
      console.log('====================');
      console.log('🔵 GOOGLE LOGIN INICIADO');
      console.log('====================');

      console.log('📬 TOKEN RECIBIDO (primeros 50 chars):', token?.substring(0, 50) || 'UNDEFINED');

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      
      console.log('🔑 CLIENT_ID:', clientId || '❌ NO CONFIGURADO');

      if (!clientId) {
        console.error('❌ GOOGLE_CLIENT_ID no está configurado en .env');
        throw new BadRequestException('GOOGLE_CLIENT_ID no está configurado');
      }

      if (!token || token.trim() === '') {
        console.error('❌ Token vacío o undefined');
        throw new BadRequestException('Token no proporcionado');
      }

      console.log('⏳ Verificando token con OAuth2Client...');
      
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: clientId,
      });

      console.log('✅ Token verificado correctamente');

      const payload = ticket.getPayload();

      console.log('👤 Email del token:', payload?.email);
      console.log('👤 Nombre del token:', payload?.name);
      console.log('👤 Google ID:', payload?.sub);

      if (!payload?.email) {
        console.error('❌ Token no contiene email');
        throw new UnauthorizedException(
          'Token Google inválido: no contiene email',
        );
      }

      console.log('🔍 Buscando usuario por email...');

      let usuario = await this.usersService.findByEmail(payload.email);

      if (!usuario) {
        console.log('➕ Usuario no existe, creando...');
        usuario = await this.usersService.createUsuario({
          nombre: payload.given_name ?? payload.name?.split(' ')[0] ?? '',
          apellido: payload.family_name ?? '',
          email: payload.email,
          password: 'GOOGLE_AUTH',
          rol: RolUsuario.CLIENTE,
          activo: true,
        });
        console.log('✅ Usuario creado:', usuario.id);
      } else {
        console.log('✅ Usuario existe.');
      }

      console.log('🎟️ Generando JWT...');

      const jwtToken = await this.jwtService.signAsync({
        sub: usuario.id,
        email: usuario.email,
        role: usuario.rol,
      });

      console.log('✅ JWT GENERADO CORRECTAMENTE');
      console.log('====================');

      return {
        message: 'Login Google exitoso',
        token: jwtToken,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      };
    } catch (error: any) {
      console.error('====================');
      console.error('❌ ERROR EN GOOGLE LOGIN:');
      console.error('Tipo:', error.constructor.name);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('====================');
      
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException(
        `Error autenticando con Google: ${error.message}`,
      );
    }
  }

  async forgotPassword(email: string) {
    const usuario = await this.usersService.findByEmail(email);

    if (!usuario) {
      // Respuesta genérica por seguridad
      return {
        message: 'Si el correo existe, recibirá instrucciones',
      };
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar el código directamente en la tabla de Aiven (Sin usar Entity)
    await this.dataSource.query(
      `INSERT INTO password_resets (email, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [email, codigo]
    );

    // Enviar el correo usando tu EmailService y la plantilla de reseteo
    await this.emailService.enviarNotificacion(
      email,
      TipoNotificacion.RESETEO_CONTRASENA,
      {
        nombre: usuario.nombre,
        codigo: codigo,
      },
    );

    return {
      message: 'Si el correo existe, recibirá instrucciones',
    };
  }

  // 4. MODIFICAR RESET PASSWORD PARA VALIDAR EL CÓDIGO DE 6 DÍGITOS
  async resetPassword(
    email: string,
    codigo: string,
    newPassword: string,
  ) {
    // Verificar si el código existe y no ha expirado en Aiven
    const resultado = await this.dataSource.query(
      `SELECT * FROM password_resets 
       WHERE email = $1 AND token = $2 AND expires_at > NOW()`,
      [email, codigo]
    );

    // Si la consulta no devuelve filas, el código no es válido o ya expiró
    if (!resultado || resultado.length === 0) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Obtener el usuario para tener su ID y actualizar la contraseña
    const usuario = await this.usersService.findByEmail(email);
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    await this.usersService.updatePassword(
      usuario.id,
      hashedPassword,
    );

    // Eliminar el código de la base de datos para que sea de un solo uso
    await this.dataSource.query(
      'DELETE FROM password_resets WHERE email = $1 AND token = $2',
      [email, codigo]
    );

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}