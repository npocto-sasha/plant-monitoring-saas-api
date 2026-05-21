import { Injectable, NotFoundException } from '@nestjs/common';
import { RecommendationSeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type RecommendationDto = {
  plantId: number;
  plantName: string;
  title: string;
  message: string;
  severity: RecommendationSeverity;
  type: string;
  metric?: string;
  value?: number | string | null;
  advice: string;
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(userId: number) {
    const plants = await this.prisma.plant.findMany({
      where: {
        userId,
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

    return plants.flatMap((plant) => this.buildRecommendationsForPlant(plant));
  }

  async getByPlant(plantId: number, userId: number) {
    const plant = await this.prisma.plant.findFirst({
      where: {
        id: plantId,
        userId,
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

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    return this.buildRecommendationsForPlant(plant);
  }

  private buildRecommendationsForPlant(plant: any): RecommendationDto[] {
    const recommendations: RecommendationDto[] = [];
    const latestTelemetry = plant.telemetry?.[0];
    const hasDevice = plant.devices && plant.devices.length > 0;

    if (!hasDevice) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Устройство не подключено',
        message:
          'Для получения показателей необходимо подключить ESP32-устройство к растению.',
        severity: RecommendationSeverity.INFO,
        type: 'DEVICE_NOT_CONNECTED',
        metric: 'device',
        value: null,
        advice: 'Добавьте устройство и привяжите его к растению.',
      });

      return recommendations;
    }

    if (!latestTelemetry) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Нет данных телеметрии',
        message:
          'Устройство подключено, но сервер еще не получил измерения с датчиков.',
        severity: RecommendationSeverity.INFO,
        type: 'NO_TELEMETRY',
        metric: 'telemetry',
        value: null,
        advice:
          'Проверьте подключение ESP32 к Wi-Fi и отправку данных на backend.',
      });

      return recommendations;
    }

    if (
      latestTelemetry.soilMoisture !== null &&
      latestTelemetry.soilMoisture < 30
    ) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Низкая влажность почвы',
        message:
          'Почва может быть слишком сухой. Растению может потребоваться полив.',
        severity:
          latestTelemetry.soilMoisture < 20
            ? RecommendationSeverity.RISK
            : RecommendationSeverity.WARNING,
        type: 'LOW_SOIL_MOISTURE',
        metric: 'soilMoisture',
        value: latestTelemetry.soilMoisture,
        advice:
          'Проверьте состояние почвы и при необходимости полейте растение.',
      });
    }

    if (
      latestTelemetry.temperature !== null &&
      latestTelemetry.temperature < 18
    ) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Температура ниже нормы',
        message:
          'Температура воздуха может быть недостаточной для комфортного роста растения.',
        severity:
          latestTelemetry.temperature < 16
            ? RecommendationSeverity.RISK
            : RecommendationSeverity.WARNING,
        type: 'LOW_TEMPERATURE',
        metric: 'temperature',
        value: latestTelemetry.temperature,
        advice:
          'Переставьте растение в более теплое место или проверьте условия в помещении.',
      });
    }

    if (latestTelemetry.light !== null && latestTelemetry.light < 300) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Недостаточная освещенность',
        message:
          'Растение может получать недостаточно света для нормального развития.',
        severity:
          latestTelemetry.light < 200
            ? RecommendationSeverity.RISK
            : RecommendationSeverity.WARNING,
        type: 'LOW_LIGHT',
        metric: 'light',
        value: latestTelemetry.light,
        advice:
          'Переставьте растение ближе к источнику света или используйте дополнительное освещение.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        plantId: plant.id,
        plantName: plant.name,
        title: 'Показатели в норме',
        message: 'Критических отклонений по основным показателям не обнаружено.',
        severity: RecommendationSeverity.NORMAL,
        type: 'NORMAL',
        metric: 'general',
        value: 'normal',
        advice: 'Продолжайте обычный уход за растением.',
      });
    }

    return recommendations;
  }
}