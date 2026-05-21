import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  private readonly demoUserId = 1;

  @Get()
  getAll() {
    return this.recommendationsService.getAll(this.demoUserId);
  }

  @Get('plants/:plantId')
  getByPlant(@Param('plantId') plantId: string) {
    return this.recommendationsService.getByPlant(
      Number(plantId),
      this.demoUserId,
    );
  }
}