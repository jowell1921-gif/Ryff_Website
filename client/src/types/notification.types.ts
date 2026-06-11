export type NotificationType = 'FOLLOW' | 'POST_LIKE' | 'POST_COMMENT' | 'MENTION' | 'REEL_LIKE' | 'REEL_COMMENT' | 'POST_REPOST'
export type ReactionType = 'APLAUSO' | 'FIRE' | 'ASOMBRA'

export interface AppNotification {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string
  reactionType: ReactionType | null
  from: {
    id: string
    name: string
    avatar: string | null
  }
  post: {
    id: string
    content: string
  } | null
  comment: {
    id: string
    content: string
  } | null
  reel: {
    id: string
    caption: string | null
  } | null
}
