import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.plant.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        devices: true,
        telemetry: {
          orderBy: {
            measuredAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const plant = await this.prisma.plant.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        devices: true,
        telemetry: {
          orderBy: {
            measuredAt: 'desc',
          },
          take: 10,
        },
        recommendations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    return plant;
  }

  async create(userId: number, dto: CreatePlantDto) {
    return this.prisma.plant.create({
      data: {
        name: dto.name,
        type: dto.type,
        location: dto.location,
        userId,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdatePlantDto) {
    await this.findOne(id, userId);

    return this.prisma.plant.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        type: dto.type,
        location: dto.location,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.plant.delete({
      where: {
        id,
      },
    });
  }
}