import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import { MembersService } from '../members/members.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    const member =
      await this.membersService.findByEmailWithPassword(email);

    if (!member) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      member.passwordHash,
    );

    if (!isPasswordValid || !member.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: member._id.toString(),
      role: member.role,
    };

    if (member.mustChangePassword) {
      const passwordChangeToken = await this.jwtService.signAsync({
        ...payload,
        purpose: 'password-change',
      });

      return {
        message: 'Password change required',
        mustChangePassword: true,
        passwordChangeToken,
      };
    }

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      mustChangePassword: false,
      accessToken,
      member: {
        id: member._id.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
      },
    };
  }


  async changePassword(
    memberId: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const { currentPassword, newPassword, confirmPassword } =
      changePasswordDto;

    // Check that the new passwords match.
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Retrieve the member, including their password hash.
    const member = await this.membersService.findByIdWithPassword(memberId);

    if (!member || !member.isActive) {
      throw new UnauthorizedException('Invalid account');
    }

    // Only accounts required to change their password can use this flow.
    if (!member.mustChangePassword) {
      throw new BadRequestException('Password change is not required');
    }

    // Verify the existing password.
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      member.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update the password and clear the mandatory-change flag.
    const updatedMember = await this.membersService.updatePassword(
      memberId,
      newPassword,
    );
    // confirm that the member was successfully update.
    if (!updatedMember) {
      throw new BadRequestException('Invalid account ');
    }

    return {
      message: 'Password changed successfully',
      member: {
        id: updatedMember?._id.toString(),
        firstName: updatedMember?.firstName,
        lastName: updatedMember?.lastName,
        email: updatedMember?.email,
        role: updatedMember?.role,
        mustChangePassword: updatedMember?.mustChangePassword,
      },
    };
  }
}
