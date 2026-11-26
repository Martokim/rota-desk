import { IsEnum } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';
export class UpdateEventStatusDto {
  @IsEnum(EventStatus)
  status: EventStatus;
}
