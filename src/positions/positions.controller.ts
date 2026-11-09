import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsService } from './positions.service';

@Controller('positions') // every route here starts with /positions
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()                       // POST /positions
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Get()                        // GET /positions
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')                   // GET /positions/123
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')                 // PATCH /positions/123
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(id, dto);
  }
}