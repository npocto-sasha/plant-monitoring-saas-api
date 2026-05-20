import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  private readonly demoUserId = 1;

  @Get()
  findAll() {
    return this.plantsService.findAll(this.demoUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(Number(id), this.demoUserId);
  }

  @Post()
  create(@Body() dto: CreatePlantDto) {
    return this.plantsService.create(this.demoUserId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantsService.update(Number(id), this.demoUserId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantsService.remove(Number(id), this.demoUserId);
  }
}