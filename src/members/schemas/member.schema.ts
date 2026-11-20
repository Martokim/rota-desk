
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Position } from '../../positions/schemas/position.schema';

export enum MemberRole {
  COORDINATOR = 'COORDINATOR',
  VOLUNTEER = 'VOLUNTEER',
}

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({
    required: true,
    enum: MemberRole,
    default: MemberRole.VOLUNTEER,
  })
  role: MemberRole;

  // References the positions this member is qualified to perform
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Position.name }],
    default: [],
  })
  positions: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default:true })
  mustChangePassword:boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
