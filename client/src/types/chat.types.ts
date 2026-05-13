export interface ChatParticipant {
  id: string
  name: string
  avatar: string | null
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
  sender: ChatParticipant
}

export interface Conversation {
  id: string
  participants: ChatParticipant[]
  messages: Pick<ChatMessage, 'id' | 'content' | 'senderId' | 'createdAt'>[]
  createdAt: string
  updatedAt: string
}
