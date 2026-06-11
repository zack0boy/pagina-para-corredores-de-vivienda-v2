import {Injectable,UnauthorizedException,ConflictException,BadRequestException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enum/roles.enum';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const usuario =
      await this.usersService.findByEmail(email);

    if (!usuario) {
      return {
        message:
          'Si el correo existe, recibirá instrucciones',
      };
    }

    const resetToken =
      await this.jwtService.signAsync(
        {
          sub: usuario.id,
        },
        {
          expiresIn: '15m',
        },
      );

    return {
      resetToken,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ) {
    const payload =
      await this.jwtService.verifyAsync(token);

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(
      payload.sub,
      hashedPassword,
    );

    return {
      message:
        'Contraseña actualizada correctamente',
    };
  }
}