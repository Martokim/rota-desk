import type { JwtSignOptions } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MembersModule } from '../members/members.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordChangeGuard } from './guards/password-change.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    MembersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret || secret === 'change-me') {
          throw new Error('A valid JWT_SECRET must be configured');
        }

        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
              '1h') as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    PasswordChangeGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}