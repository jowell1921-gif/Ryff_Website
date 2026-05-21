export type ReactionType = 'APLAUSO' | 'FIRE' | 'ASOMBRA'

export interface Reel {
  id: string
  videoUrl: string
  thumbnailUrl: string | null
  caption: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
  clapCount: number
  fireCount: number
  asombraCount: number
  isClapped: boolean
  isFired: boolean
  isAsombra: boolean
  commentCount: number
}

export interface ReelComment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface ReelReactionResponse {
  clapCount: number
  fireCount: number
  asombraCount: number
  isClapped: boolean
  isFired: boolean
  isAsombra: boolean
}
