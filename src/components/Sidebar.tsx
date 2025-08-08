import { useMemo, useState } from 'react'
import type { Contact, Conversation } from '../types'

export function Sidebar({
  contacts,
  onSelectContact,
  activeConversationId,
  loading,
}: {
  contacts: Array<Contact & { conversation?: Conversation | null }>
  onSelectContact: (contact: Contact) => void
  activeConversationId?: number
  loading?: boolean
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(c => c.name.toLowerCase().includes(q))
  }, [contacts, query])

  return (
    <div className="flex flex-col h-full">
      {/* Header + Search */}
      <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="relative">
          <input
            placeholder="Buscar contactos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-700/60 px-4 py-2 pl-4 pr-10 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">⌘K</span>
        </div>
      </div>
      {/* Chats */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="p-4 text-sm text-zinc-500">Cargando...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-4 text-sm text-zinc-500">Sin resultados</div>
        )}
        <ul>
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelectContact(c)}
                className={`w-full flex items-stretch gap-3 px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${c.conversation?.id === activeConversationId ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold flex-shrink-0">
                  {c.name.slice(0,1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate flex-1">{c.name}</p>
                    <span className="text-[11px] text-zinc-500">{c.conversation?.id ? `#${c.conversation.id}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-zinc-500 truncate flex-1">{c.conversation ? 'Último mensaje • vista previa' : 'Sin conversación'}</p>
                    {/* Placeholder de hora */}
                    <span className="text-[11px] text-zinc-400">{c.conversation ? 'hoy' : ''}</span>
                  </div>
                </div>
              </button>
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60 ml-[4.5rem]"></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 