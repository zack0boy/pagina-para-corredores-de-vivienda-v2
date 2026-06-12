import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================
  // Login con email/password
  // POST /auth/login
  // ==========================
  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  // ==========================
  // Registro
  // POST /auth/register
  // ==========================
  @Post('register')
async register(
  @Body()
  body: {
    nombre: string;
    email: string;
    password: string;
  },
) {
  return this.authService.register(
    body.nombre,
    body.email,
    body.password,
  );
}

  // ==========================
  // Login con Google
  // POST /auth/google
  // ==========================
  @Post('google')
  async googleLogin(@Body() body: any) {
    console.log('====================');
    console.log('📥 BODY RECIBIDO EN CONTROLLER:');
    console.log(JSON.stringify(body, null, 2));
    console.log('====================');

    return this.authService.googleLogin(
      body.token,
    );
  }

  // ==========================
  // Recuperar contraseña
  // POST /auth/forgot-password
  // ==========================
  @Post('forgot-password')
  async forgotPassword(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(
      body.email,
    );
  }

  // ==========================
  // Resetear contraseña
  // POST /auth/reset-password
  // ==========================
@Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; codigo: string; newPassword: string }
  ) {
    // Aquí le pasas los 3 argumentos que el servicio ahora exige
    return this.authService.resetPassword(
      body.email,
      body.codigo,
      body.newPassword,
    );
  }
}