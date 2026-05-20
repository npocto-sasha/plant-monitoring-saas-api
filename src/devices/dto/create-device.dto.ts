export class CreateDeviceDto {
  name!: string;
  deviceCode!: string;
  activationKey?: string;
}