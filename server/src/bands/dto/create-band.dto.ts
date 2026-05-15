import { IsString, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator'

export class CreateBandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string

  @IsOptional()
  @IsArray()
  genres?: string[]

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsArray()
  lookingFor?: string[]

  @IsOptional()
  @IsString()
  creatorInstrument?: string
}
