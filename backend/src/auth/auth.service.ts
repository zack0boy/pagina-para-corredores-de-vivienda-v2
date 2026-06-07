import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RolUsuario, EstadoGeneral } from '../common/enum/estado.enum';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  async googleLogin(token: string) {

    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException(
        'Token Google inválido',
      );
    }

    let googleUser =
      await this.usersService.findGoogleUserByEmail(
        payload.email!,
      );

    if (!googleUser) {

      // Crear usuario principal
      const usuario =
        await this.usersService.createUsuario({
          nombre: payload.name!,
          email: payload.email!,
          password: '',
          rol: RolUsuario.CLIENTE,
          estado: EstadoGeneral.ACTIVO,
        });

      // Crear registro Google
      googleUser =
        await this.usersService.createGoogleUser({
          idUsuario: usuario.idUsuario,
          googleId: payload.sub,
          googleEmail: payload.email!,
          googlePicture: payload.picture,
        });
    }

    const jwt =
      await this.jwtService.signAsync({
        sub: googleUser.idUsuario,
        email: googleUser.googleEmail,
      });

    return {
      message: 'Login Google exitoso',
      user: googleUser,
      jwt,
    };
  }
}