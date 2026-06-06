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

    synchronize: true,
  }),
};