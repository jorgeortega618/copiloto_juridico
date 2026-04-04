import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExpedienteDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateExpedienteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
