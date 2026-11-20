import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Member, MemberRole } from './schemas/member.schema';

interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mustChangePassword?: boolean;
  phone?: string;
  role?: MemberRole;
  positions?: Types.ObjectId[];
}

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<Member>,
  ) {}

async create(memberData: CreateMemberInput) {
  const { password, ...memberDetails } = memberData;

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await this.memberModel.create({
      ...memberDetails,
      email: memberDetails.email.trim().toLowerCase(),
      passwordHash,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new ConflictException('A member with this email already exists');
    }

    throw error;
  }
}

  findByEmail(email: string) {
    return this.memberModel
      .findOne({ email: email.trim().toLowerCase() })
      .exec();
  }

  findByEmailWithPassword(email: string) {
    return this.memberModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  findById(id: string) {
    return this.memberModel.findById(id).exec();
  }
}