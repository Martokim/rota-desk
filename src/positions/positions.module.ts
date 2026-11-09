import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  // registers the schema so the service can inject the model
  imports: [MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }])],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService], // so other modules (like events) can use it later
})
export class PositionsModule {}