import { api } from '@/lib/api'
import type { Conversation, ChatMessage } from '@/types/chat.types'

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/conversations')
    return data
  },

  getOrCreateConversation: async (targetUserId: string): Promise<Conversation> => {
    const { data } = await api.post<Conversation>('/conversations', { targetUserId })
    return data
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get<ChatMessage[]>(`/conversations/${conversationId}/messages`)
    return data
  },
}
