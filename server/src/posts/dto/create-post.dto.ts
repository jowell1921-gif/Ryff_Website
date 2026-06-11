import { IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string

  @IsOptional()
  @IsUrl()
  mediaUrl?: string

  @IsOptional()
  @IsString()
  mediaName?: string

  @IsOptional()
  @IsString()
  mediaType?: string
}
