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
    <div className="fixed inset-0 z-50" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl shadow-2xl"
        style={{ width: '100%', maxWidth: 480 }}
      >
        {/* Header */}
        <div
          className="border-b border-[var(--color-border)]"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Nueva conversación</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Buscador */}
        <div className="border-b border-[var(--color-border)]" style={{ padding: '16px 24px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              className="absolute text-[var(--color-text-muted)] pointer-events-none"
              style={{ left: 14, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar músico por nombre..."
              style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 42, paddingRight: 40, fontSize: 14, width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' }}
              className="placeholder:text-[var(--color-text-muted)] focus:border-purple-500 transition-colors"
            />
            {isSearching && (
              <Loader2
                size={15}
                className="absolute text-purple-400 animate-spin"
                style={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
          </div>
        </div>

        {/* Resultados */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {!query.trim() && (
            <p
              className="text-[var(--color-text-muted)]"
              style={{ fontSize: 13, textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}
            >
              Escribe el nombre de un músico
            </p>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <p
              className="text-[var(--color-text-muted)]"
              style={{ fontSize: 13, textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}
            >
              Sin resultados para &quot;{query}&quot;
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: results.length > 0 ? '12px 16px' : 0 }}>
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => openChat.mutate(user.id)}
                disabled={openChat.isPending}
                className="hover:bg-[var(--color-surface)] transition-colors disabled:opacity-60"
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: '1px solid transparent' }}
              >
                <Avatar size="md" src={user.avatar} alt={user.name} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</p>
                  {user.location && (
                    <p className="truncate" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.location}</p>
                  )}
                </div>
                {openChat.isPending && (
                  <Loader2 size={15} className="text-purple-400 animate-spin shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
