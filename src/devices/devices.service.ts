import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeviceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { BindDeviceDto } from './dto/bind-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.device.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plant: true,
      },
    });
  }

  async findOne(id: number, userId: number) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        plant: true,
        telemetry: {
          orderBy: {
            measuredAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async create(userId: number, dto: CreateDeviceDto) {
    if (!dto || !dto.name) {
      throw new BadRequestException('Device name is required');
    }

    if (!dto.deviceCode) {
      throw new BadRequestException('Device code is required');
    }

    return this.prisma.device.create({
      data: {
        name: dto.name,
        deviceCode: dto.deviceCode,
        activationKey: dto.activationKey,
        status: DeviceStatus.ACTIVE,
        userId,
      },
    });
  }

  async bindToPlant(id: number, userId: number, dto: BindDeviceDto) {
    if (!dto || !dto.plantId) {
      throw new BadRequestException('Plant id is required');
    }

    await this.findOne(id, userId);

    const plant = await this.prisma.plant.findFirst({
      where: {
        id: Number(dto.plantId),
        userId,
      },
    });

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    return this.prisma.device.update({
      where: {
        id,
      },
      data: {
        plantId: plant.id,
      },
      include: {
        plant: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.device.delete({
      where: {
        id,
      },
    });
  }
}