import type { Conversation, Message } from '../types'
import { MessageBubble } from './MessageBubble'
import { useEffect, useMemo, useRef } from 'react'
import { Composer } from './Composer'
import { DateSeparator } from './DateSeparator'
import { Search, Paperclip, MoreVertical } from 'lucide-react'

function formatDateLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  if (isToday) return 'Hoy'
  if (isYesterday) return 'Ayer'
  return d.toLocaleDateString()
}

export function Chat({
  conversation,
  messages,
  onSend,
  currentUserId,
  loading,
}: {
  conversation?: Conversation | null
  messages: Message[]
  onSend: (text: string) => void
  currentUserId: number
  loading?: boolean
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const grouped = useMemo(() => {
    const groups: { date: string; items: Message[] }[] = []
    for (const m of messages) {
      const dateKey = new Date(m.createdAt).toDateString()
      const last = groups[groups.length - 1]
      if (!last || last.date !== dateKey) groups.push({ date: dateKey, items: [m] })
      else last.items.push(m)
    }
    return groups
  }, [messages])

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Selecciona un contacto para comenzar
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-3 bg-white/70 dark:bg-zinc-900/60">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold">
          {conversation.title?.slice(0,1).toUpperCase() || '#'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{conversation.title || `Conversación #${conversation.id}`}</p>
          <p className="text-xs text-zinc-500 truncate">En línea</p>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <button title="Buscar" className="hover:text-zinc-700 dark:hover:text-zinc-300"><Search size={18} /></button>
          <button title="Adjuntar" className="hover:text-zinc-700 dark:hover:text-zinc-300"><Paperclip size={18} /></button>
          <button title="Más" className="hover:text-zinc-700 dark:hover:text-zinc-300"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={listRef} className="flex-1 overflow-auto p-4 sm:p-6 space-y-2">
        {loading && messages.length === 0 && (
          <div className="text-sm text-zinc-500">Cargando mensajes...</div>
        )}
        {grouped.map(group => (
          <div key={group.date}>
            <DateSeparator label={formatDateLabel(group.items[0].createdAt)} />
            <div className="space-y-2">
              {group.items.map(m => (
                <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-zinc-200/60 dark:border-zinc-700/60 p-3 bg-white/70 dark:bg-zinc-900/60">
        <Composer onSend={onSend} />
      </div>
    </div>
  )
} 