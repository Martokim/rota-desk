import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { Member } from '../../members/schemas/member.schema';
import { Event } from '../../events/schemas/event.schema';
import { Position } from '../../positions/schemas/position.schema';

export enum AssignmentStatus {
  APPLIED = 'APPLIED', 
  INVITED = 'INVITED', 
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED', 
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Member.name,
  })
  member: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Event.name,
  })
  event: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Position.name,
  })
  position: Types.ObjectId;

  // No default: the service must choose APPLIED or INVITED on purpose
  @Prop({ required: true, enum: AssignmentStatus })
  status: AssignmentStatus;

  // Copies of the event's dates, so overlap can be checked in one query
  @Prop({ required: true, type: Date })
  eventStartDate: Date;

  @Prop({ required: true, type: Date })
  eventEndDate: Date;

  // Records why an assignment was cancelled
  @Prop({ trim: true, maxlength: 500 })
  cancellationReason?: string;

  // Attendance is recorded after the event
  @Prop()
  attended?: boolean;

  @Prop({ type: Date })
  attendanceRecordedAt?: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

// One assignment per volunteer per event
AssignmentSchema.index({ event: 1, member: 1 }, { unique: true });

// Supports the overlap check and a member's history
AssignmentSchema.index({
  member: 1,
  status: 1,
  eventStartDate: 1,
  eventEndDate: 1,
});

// Supports listing an event's assignments by status
AssignmentSchema.index({ event: 1, status: 1 });