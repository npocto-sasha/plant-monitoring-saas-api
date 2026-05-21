import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTelemetryDto) {
    if (!dto || !dto.deviceCode) {
      throw new BadRequestException('Device code is required');
    }

    const device = await this.prisma.device.findUnique({
      where: {
        deviceCode: dto.deviceCode,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (!device.plantId) {
      throw new BadRequestException('Device is not bound to a plant');
    }

    return this.prisma.telemetryMeasurement.create({
      data: {
        deviceId: device.id,
        plantId: device.plantId,
        soilMoisture: dto.soilMoisture,
        temperature: dto.temperature,
        light: dto.light,
      },
      include: {
        device: true,
        plant: true,
      },
    });
  }

  async getLatestByPlant(plantId: number) {
    const latest = await this.prisma.telemetryMeasurement.findFirst({
      where: {
        plantId,
      },
      orderBy: {
        measuredAt: 'desc',
      },
      include: {
        device: true,
      },
    });

    if (!latest) {
      throw new NotFoundException('Telemetry not found');
    }

    return latest;
  }

  async getHistoryByPlant(plantId: number) {
    return this.prisma.telemetryMeasurement.findMany({
      where: {
        plantId,
      },
      orderBy: {
        measuredAt: 'asc',
      },
      take: 50,
      include: {
        device: true,
      },
    });
  }
}