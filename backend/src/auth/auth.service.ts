import {Injectable,UnauthorizedException,ConflictException} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EstadoGeneral} from '../common/enum/estado.enum';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enum/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

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
        email,
        password: hashedPassword,
        rol: RolUsuario.CLIENTE,
        estado: EstadoGeneral.ACTIVO,
      });

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: usuario.idUsuario,
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
        sub: usuario.idUsuario,
        email: usuario.email,
        role: usuario.rol,
      });

    return {
      token,
      user: {
        id: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async googleLogin(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException(
        'Token Google inválido',
      );
    }

    let googleUser =
      await this.usersService.findGoogleUserByEmail(
        payload.email,
      );

    if (!googleUser) {
      let usuario =
        await this.usersService.findByEmail(
          payload.email,
        );

      if (!usuario) {
        usuario =
          await this.usersService.createUsuario({
            nombre: payload.name ?? '',
            email: payload.email,
            password: 'GOOGLE_AUTH',
            rol: RolUsuario.CLIENTE,
            estado: EstadoGeneral.ACTIVO,
          });
      }

      await this.usersService.createGoogleUser({
        idUsuario: usuario.idUsuario,
        googleId: payload.sub,
        googleEmail: payload.email,
        googlePicture: payload.picture,
      });

      googleUser =
        await this.usersService.findGoogleUserByEmail(
          payload.email,
        );
    }

    if (!googleUser?.usuario) {
      throw new UnauthorizedException(
        'No fue posible autenticar el usuario',
      );
    }

    const jwt =
      await this.jwtService.signAsync({
        sub: googleUser.usuario.idUsuario,
        email: googleUser.usuario.email,
        role: googleUser.usuario.rol,
      });

    return {
      message: 'Login Google exitoso',
      token: jwt,
      user: {
        id: googleUser.usuario.idUsuario,
        nombre: googleUser.usuario.nombre,
        email: googleUser.usuario.email,
        rol: googleUser.usuario.rol,
        picture: googleUser.googlePicture,
      },
    };
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
          sub: usuario.idUsuario,
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