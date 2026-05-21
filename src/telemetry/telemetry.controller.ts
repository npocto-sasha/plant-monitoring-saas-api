import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  create(@Body() dto: CreateTelemetryDto) {
    return this.telemetryService.create(dto);
  }

  @Get('plants/:plantId/latest')
  getLatestByPlant(@Param('plantId') plantId: string) {
    return this.telemetryService.getLatestByPlant(Number(plantId));
  }

  @Get('plants/:plantId/history')
  getHistoryByPlant(@Param('plantId') plantId: string) {
    return this.telemetryService.getHistoryByPlant(Number(plantId));
  }
}