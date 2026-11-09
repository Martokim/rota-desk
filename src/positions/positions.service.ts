import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position, PositionDocument } from './schemas/position.schema';

@Injectable() // lets Nest create this class and hand it to others
export class PositionsService {
  constructor(
    // Nest gives us the Mongoose model for positions (dependency injection)
    @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
  ) {}

  async create(dto: CreatePositionDto) {
    try {
      return await this.positionModel.create(dto);
    } catch (error: any) {
      // 11000 is MongoDB's "duplicate key" error from the unique index
      if (error?.code === 11000) {
        throw new ConflictException('A position with this name already exists'); // 409
      }
      throw error;
    }
  }

  findAll() {
    return this.positionModel.find().sort({ name: 1 }).exec(); // sorted A to Z
  }

  async findOne(id: string) {
    const position = await this.positionModel.findById(id).exec();
    if (!position) throw new NotFoundException('Position not found'); // 404
    return position;
  }

  async update(id: string, dto: UpdatePositionDto) {
    try {
      const position = await this.positionModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .exec();
      if (!position) throw new NotFoundException('Position not found');
      return position;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('A position with this name already exists');
      }
      throw error;
    }
  }
}