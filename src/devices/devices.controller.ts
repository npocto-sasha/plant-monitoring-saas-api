import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { BindDeviceDto } from './dto/bind-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  private readonly demoUserId = 1;

  @Get()
  findAll() {
    return this.devicesService.findAll(this.demoUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(Number(id), this.demoUserId);
  }

  @Post()
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(this.demoUserId, dto);
  }

  @Patch(':id/bind-plant')
  bindToPlant(@Param('id') id: string, @Body() dto: BindDeviceDto) {
    return this.devicesService.bindToPlant(Number(id), this.demoUserId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(Number(id), this.demoUserId);
  }
}