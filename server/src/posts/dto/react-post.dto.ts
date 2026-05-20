import { IsEnum } from 'class-validator'
import { ReactionType } from '@prisma/client'

export class ReactPostDto {
  @IsEnum(ReactionType)
  type: ReactionType
}
