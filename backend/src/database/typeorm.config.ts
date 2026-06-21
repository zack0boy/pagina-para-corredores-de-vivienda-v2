import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],

  inject: [ConfigService],

  useFactory: (configService: ConfigService) => ({
    type: 'postgres',

    host: configService.get<string>('DB_HOST'),

    port: Number(configService.get<string>('DB_PORT')),

    username: configService.get<string>('DB_USERNAME'),

    password: configService.get<string>('DB_PASSWORD'),

    database: configService.get<string>('DB_NAME'),

    ssl: {
      rejectUnauthorized: false,
    },

    autoLoadEntities: true,

    synchronize: false,

    // Pool de conexiones: reutiliza conexiones a la BD remota (Aiven)
    // en lugar de abrir una nueva (con handshake SSL) en cada consulta.
    extra: {
      max: 10,              // máximo de conexiones en el pool
      keepAlive: true,      // mantiene viva la conexión TCP
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  }),
};