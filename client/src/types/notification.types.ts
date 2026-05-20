export type NotificationType = 'FOLLOW' | 'POST_LIKE' | 'POST_COMMENT'

export interface AppNotification {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string
  from: {
    id: string
    name: string
    avatar: string | null
  }
  post: {
    id: string
    content: string
  } | null
}
