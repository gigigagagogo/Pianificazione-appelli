import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PGHOST', 'localhost'),
        port: configService.get<number>('PGPORT', 5432),
        username: configService.get<string>('PGUSER', 'appelli'),
        password: configService.get<string>('PGPASSWORD', 'appelli'),
        database: configService.get<string>('PGDATABASE', 'appelli'),
        autoLoadEntities: true,
        // No migrations yet: auto-sync schema from entities. Switch to migrations before real deployment.
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
