export class CreateTelemetryDto {
  deviceCode!: string;
  soilMoisture?: number;
  temperature?: number;
  light?: number;
}