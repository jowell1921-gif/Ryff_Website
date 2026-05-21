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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }} className="group">
        <span className="text-[10px] text-[var(--color-text-muted)] self-end opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
        <div
          className="rounded-2xl rounded-tr-sm bg-purple-600 text-white leading-relaxed"
          style={{ maxWidth: '70%', padding: '10px 16px', fontSize: 14 }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }} className="group">
      {/* Avatar del otro usuario — solo en el último mensaje consecutivo */}
      <div style={{ width: 28, flexShrink: 0 }}>
        {showAvatar && (
          <Avatar size="xs" src={message.sender.avatar} alt={message.sender.name} />
        )}
      </div>

      <div
        className="rounded-2xl rounded-tl-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] leading-relaxed"
        style={{ maxWidth: '70%', padding: '10px 16px', fontSize: 14 }}
      >
        {message.content}
      </div>

      <span className="text-[10px] text-[var(--color-text-muted)] self-end opacity-0 group-hover:opacity-100 transition-opacity">
        {time}
      </span>
    </div>
  )
}
