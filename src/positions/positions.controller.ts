import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsService } from './positions.service';
import { MemberRole } from '../members/schemas/member.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('positions') // every route here starts with /positions
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()  
  @Roles(MemberRole.COORDINATOR)
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Get()    
  @Roles(MemberRole.COORDINATOR, MemberRole.VOLUNTEER)                   
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @Roles(MemberRole.COORDINATOR, MemberRole.VOLUNTEER)                   // GET /positions/123
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')  
  @Roles(MemberRole.COORDINATOR)              
  update(@Param('id', ParseObjectIdPipe) id: string, 
  @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(id, dto);
  }
}