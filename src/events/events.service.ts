import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PositionsService } from '../positions/positions.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventDocument, EventStatus } from './schemas/event.schema';
import { MemberRole } from '../members/schemas/member.schema';
import { canTransition } from './event-status.rules';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,

    private readonly positionsService: PositionsService,
  ) {}

  async create(dto: CreateEventDto) {
    // 1. Validate event dates
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException(
        'Event end date must be later than start date',
      );
    }

    // 2. Extract position IDs
    const positionIds = dto.requiredPositions.map((item) => item.position);

    // 3. Reject duplicate position IDs
    const uniquePositionIds = [...new Set(positionIds)];

    if (uniquePositionIds.length !== positionIds.length) {
      throw new BadRequestException(
        'A position cannot be added more than once to an event',
      );
    }

    // 4. Verify that all positions exist
    const existingIds =
      await this.positionsService.findExistingIds(positionIds);

    if (existingIds.length !== positionIds.length) {
      throw new BadRequestException(
        'One or more selected positions do not exist',
      );
    }

    // 5. Save the event
    return this.eventModel.create(dto);
  }

  findAll(role: MemberRole) {
    // Coordinators can see every event.
    if (role === MemberRole.COORDINATOR) {
      return this.eventModel.find().sort({ startDate: 1 }).exec();
    }

    // Volunteers only see published and postponed events.
    return this.eventModel
      .find({
        status: { $in: [EventStatus.PUBLISHED, EventStatus.POSTPONED] },
      })
      .sort({ startDate: 1 })
      .exec();
  }

  async findOne(id: string, role: MemberRole) {
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Volunteers should not access hidden or completed events.
    if (
      role === MemberRole.VOLUNTEER &&
      ![EventStatus.PUBLISHED, EventStatus.POSTPONED].includes(event.status)
    ) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async changeStatus(id: string, status: EventStatus) {
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check whether the requested transition is allowed.
    if (!canTransition(event.status, status)) {
      throw new BadRequestException(
        `Cannot change event status from ${event.status} to ${status}`,
      );
    }

    // An event needs at least one required position before publishing.
    if (
      status === EventStatus.PUBLISHED &&
      event.requiredPositions.length === 0
    ) {
      throw new BadRequestException(
        'An event must have at least one required position before publishing',
      );
    }

    event.status = status;
    return event.save();
  }
}
