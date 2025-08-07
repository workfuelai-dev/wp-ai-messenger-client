import type { Message } from '../types'

export function MessageBubble({ message, isOwn }: { message: Message, isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-700/60 rounded-bl-sm'}`}>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`mt-1 text-[10px] ${isOwn ? 'text-indigo-100/80' : 'text-zinc-500'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  )
} 