import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar } from '@/components/ui/Avatar'
import type { ChatMessage } from '@/types/chat.types'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar: boolean
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm', { locale: es })

  if (isOwn) {
    return (
      <div className="flex justify-end gap-2 group">
        <span className="text-[10px] text-[var(--color-text-muted)] self-end opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
        <div className="max-w-[70%] px-4 py-2 rounded-2xl rounded-tr-sm bg-purple-600 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 group">
      {/* Avatar del otro usuario — solo en el último mensaje consecutivo */}
      <div className="w-7 shrink-0">
        {showAvatar && (
          <Avatar size="xs" src={message.sender.avatar} alt={message.sender.name} />
        )}
      </div>

      <div className="max-w-[70%] px-4 py-2 rounded-2xl rounded-tl-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] leading-relaxed">
        {message.content}
      </div>

      <span className="text-[10px] text-[var(--color-text-muted)] self-end opacity-0 group-hover:opacity-100 transition-opacity">
        {time}
      </span>
    </div>
  )
}
