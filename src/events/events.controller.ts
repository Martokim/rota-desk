import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberRole } from '../members/schemas/member.schema';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(MemberRole.COORDINATOR)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  @Roles(MemberRole.COORDINATOR, MemberRole.VOLUNTEER)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.eventsService.findAll(req.user!.role);
  }

  @Get(':id')
  @Roles(MemberRole.COORDINATOR, MemberRole.VOLUNTEER)
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.eventsService.findOne(id, req.user!.role);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: UpdateEventStatusDto) {
    return this.eventsService.changeStatus(id, dto.status);
  }
}
