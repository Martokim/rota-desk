import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordChangeGuard } from './guards/password-change.guard';
import { Request as ExpressRequest } from 'express';

interface PasswordChangeRequest extends ExpressRequest {
  user: {
    sub: string;
    role: string;
    purpose: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }

  @UseGuards(PasswordChangeGuard)
  @Post('change-password')
  changePassword(
  @Request() request: PasswordChangeRequest,
  @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user.sub,
      changePasswordDto,
    );
  }
}
