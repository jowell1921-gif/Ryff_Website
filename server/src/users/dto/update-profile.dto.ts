import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instruments?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[]
}
