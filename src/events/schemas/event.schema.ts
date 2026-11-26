import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, trim: true })
  location: string;

  // Positions and required volunteer slots for this event
  @Prop({
    type: [
      {
        position: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'Position',
          required: true,
        },
        slots: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    default: [],
  })
  requiredPositions: {
    position: Types.ObjectId;
    slots: number;
  }[];

  @Prop({
    required: true,
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Supports querying events by their start date
EventSchema.index({ startDate: 1 });
