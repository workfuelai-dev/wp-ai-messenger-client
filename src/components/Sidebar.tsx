import { useMemo, useState } from 'react'
import type { Contact, Conversation } from '../types'
import { SettingsDialog } from './SettingsDialog'

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
  const [openSettings, setOpenSettings] = useState(false)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const data = contacts.slice().sort((a, b) => (Number(!!b.pinned) - Number(!!a.pinned)) || (Number((b.unreadCount||0)>0) - Number((a.unreadCount||0)>0)))
    if (!q) return data
    return data.filter(c => c.name.toLowerCase().includes(q))
  }, [contacts, query])

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="px-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold">U</div>
        <div className="text-sm font-medium flex-1 truncate">Tú</div>
        <button title="Nuevo chat" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">✚</button>
        <button title="Ajustes" onClick={() => setOpenSettings(true)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">⚙︎</button>
      </div>

      {/* Search */}
      <div className="p-3">
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
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${c.conversation?.id === activeConversationId ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}
                style={{ minHeight: 64 }}
              >
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white grid place-items-center font-semibold flex-shrink-0">
                    {c.name.slice(0,1).toUpperCase()}
                  </div>
                  {c.online && <span className="absolute -right-0 -bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate flex-1">{c.name}</p>
                    <span className="text-[11px] text-zinc-500">{c.lastAt || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs truncate flex-1 ${c.unreadCount ? 'text-white' : 'text-zinc-500'}`}>{c.lastText || (c.conversation ? 'Último mensaje' : 'Sin conversación')}</p>
                    {c.unreadCount ? (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[11px] grid place-items-center">{c.unreadCount}</span>
                    ) : (
                      <span className="text-[11px] text-zinc-400">{c.conversation?.id ? `#${c.conversation.id}` : ''}</span>
                    )}
                  </div>
                </div>
              </button>
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60 ml-[4.2rem]"></div>
            </li>
          ))}
        </ul>
      </div>

      <SettingsDialog open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  )
} 