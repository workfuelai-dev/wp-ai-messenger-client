import type { Conversation, Message } from '../types'
import { MessageBubble } from './MessageBubble'
import { useEffect, useRef } from 'react'
import { Composer } from './Composer'

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

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Selecciona un contacto para comenzar
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold">
          {conversation.title?.slice(0,1).toUpperCase() || '#'}
        </div>
        <div>
          <p className="font-medium">{conversation.title || `Conversación #${conversation.id}`}</p>
          <p className="text-xs text-zinc-500">Activo</p>
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-zinc-100/50 dark:to-zinc-900/30">
        {loading && messages.length === 0 && (
          <div className="text-sm text-zinc-500">Cargando mensajes...</div>
        )}
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
        ))}
      </div>
      <div className="border-t border-zinc-200/60 dark:border-zinc-700/60 p-3">
        <Composer onSend={onSend} />
      </div>
    </div>
  )
} 