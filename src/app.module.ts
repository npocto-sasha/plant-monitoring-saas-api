import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from "./prisma/prisma.module";
import { PlantsModule } from './plants/plants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PlantsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
