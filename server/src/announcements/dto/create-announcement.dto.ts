import { IsString, IsEnum, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator'
import { AnnouncementType } from '@prisma/client'

export class CreateAnnouncementDto {
  @IsEnum(AnnouncementType)
  type: AnnouncementType

  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instruments?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[]

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string
}
