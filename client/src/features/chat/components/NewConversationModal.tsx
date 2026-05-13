import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Search, X, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { chatService } from '../services/chatService'
import { profileService } from '@/features/profile/services/profileService'
import type { UserProfile } from '@/types/user.types'

interface NewConversationModalProps {
  onClose: () => void
}

export function NewConversationModal({ onClose }: NewConversationModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounce: busca usuarios mientras escribe
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const users = await profileService.searchUsers({ search: query.trim() })
        setResults(users)
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  // Cierra con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const openChat = useMutation({
    mutationFn: (targetUserId: string) => chatService.getOrCreateConversation(targetUserId),
    onSuccess: (conv) => {
      onClose()
      navigate(`/messages/${conv.id}`)
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text)]">Nueva conversación</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar músico por nombre..."
              style={{ paddingLeft: '2rem' }}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-2 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-72 overflow-y-auto">
          {!query.trim() && (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-8">
              Escribe el nombre de un músico
            </p>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-8">
              Sin resultados para &quot;{query}&quot;
            </p>
          )}

          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => openChat.mutate(user.id)}
              disabled={openChat.isPending}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--color-surface)] transition-colors text-left disabled:opacity-60"
            >
              <Avatar size="md" src={user.avatar} alt={user.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.name}</p>
                {user.location && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{user.location}</p>
                )}
              </div>
              {openChat.isPending && (
                <Loader2 size={14} className="text-purple-400 animate-spin shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
