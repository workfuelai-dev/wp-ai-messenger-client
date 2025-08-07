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
      <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-700/60">
        <input
          placeholder="Buscar contactos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-700/60 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="p-4 text-sm text-zinc-500">Cargando...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-4 text-sm text-zinc-500">Sin resultados</div>
        )}
        <ul className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelectContact(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40 ${c.conversation?.id === activeConversationId ? 'bg-zinc-100/80 dark:bg-zinc-900/60' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold">
                  {c.name.slice(0,1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.conversation?.id && (
                      <span className="text-xs text-zinc-500">#{c.conversation.id}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{c.conversation ? 'Conversación activa' : 'Sin conversación'}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 