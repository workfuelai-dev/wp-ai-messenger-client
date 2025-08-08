import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Contact, Conversation, Message } from '../types'
// @ts-ignore
import { io, Socket } from 'socket.io-client'
import { supabase } from '../lib/supabase'

const mockContacts: Contact[] = [
  { id: 101, name: 'Ana López' },
  { id: 102, name: 'Carlos Pérez' },
  { id: 103, name: 'María Rodríguez' },
  { id: 104, name: 'Juan García' },
]

export function useMessenger() {
  const [contacts, setContacts] = useState<Array<Contact & { conversation?: Conversation | null }>>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const currentUserId = 1
  const socketRef = useState<Socket | null>(null)[0]
  const isStatic = typeof window !== 'undefined' && location.hostname.endsWith('github.io')
  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchInitial().finally(() => active && setLoading(false))

    async function fetchInitial() {
      try {
        if (hasSupabase) {
          // Intentar leer contactos desde tablas (contacts) o derivarlos desde conversations
          const { data: convs, error } = await supabase
            .from('conversations')
            .select('id, contact_id, contacts:contact_id ( id, name )')
            .limit(50)
          if (error) throw error
          const list: Contact[] = (convs || []).map((c: any) => ({ id: c.contacts?.id ?? c.contact_id, name: c.contacts?.name ?? `Contacto ${c.contact_id}` }))
          const withConv = list.map((c: Contact, idx: number) => ({ ...c, conversation: convs?.[idx] ? { id: (convs as any)[idx].id, contactId: c.id, title: c.name } : null }))
          setContacts(enrichContacts(withConv))
          return
        }
        const data = await api.getContacts()
        setContacts(enrichContacts(data).map(c => ({ ...c, conversation: null })))
      } catch {
        setContacts(enrichContacts(mockContacts).map(c => ({ ...c, conversation: null })))
      }
    }

    return () => { active = false }
  }, [hasSupabase])

  useEffect(() => {
    if (!selectedConversation) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        if (hasSupabase) {
          const { data: msgs, error } = await supabase
            .from('messages')
            .select('id, conversation_id, sender_id, text, created_at')
            .eq('conversation_id', selectedConversation.id)
            .order('created_at', { ascending: true })
          if (error) throw error
          const normalized: Message[] = (msgs || []).map(m => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            text: m.text,
            createdAt: m.created_at,
          }))
          if (active) setMessages(normalized)
        } else {
          const msgs = await api.getMessages(selectedConversation.id)
          if (active) setMessages(msgs)
        }
      } catch {
        if (active) setMessages([
          { id: 1, conversationId: selectedConversation.id, senderId: 2, text: 'Previsualización de conversación.', createdAt: new Date(Date.now() - 600000).toISOString() },
          { id: 2, conversationId: selectedConversation.id, senderId: 1, text: 'Hola 👋', createdAt: new Date(Date.now() - 300000).toISOString() },
        ])
      } finally {
        if (active) setLoading(false)
      }
    })()

    // Realtime si hay supabase
    if (hasSupabase) {
      const channel = supabase
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
          const m = payload.new as any
          const msg: Message = { id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, text: m.text, createdAt: m.created_at }
          setMessages(prev => [...prev, msg])
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }

    return () => { active = false }
  }, [selectedConversation?.id, hasSupabase])

  useEffect(() => {
    if (isStatic || hasSupabase) return // si usamos supabase, no usar socket.io
    try {
      const s = io('/', { path: '/socket.io' })
      ;(socketRef as any).current = s
      s.on('message:new', (msg: Message) => {
        setMessages(prev => {
          if (selectedConversation && msg.conversationId === selectedConversation.id) {
            return [...prev, msg]
          }
          return prev
        })
        setContacts(prev => updatePreview(prev, msg))
      })
      return () => { s.disconnect() }
    } catch {
      // ignorar
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, hasSupabase])

  async function selectContact(contact: Contact) {
    try {
      if (hasSupabase) {
        // asegurar conversación existente o crearla
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('contact_id', contact.id)
          .maybeSingle()
        let convId = existing?.id
        if (!convId) {
          const { data: created, error } = await supabase
            .from('conversations')
            .insert({ contact_id: contact.id })
            .select('id')
            .single()
          if (error) throw error
          convId = created.id
        }
        const conversation = { id: convId!, contactId: contact.id, title: contact.name }
        setSelectedConversation(conversation)
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation, unreadCount: 0 } : c))
        return
      }
      const conversation = await api.ensureConversation(contact.id)
      setSelectedConversation(conversation)
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation, unreadCount: 0 } : c))
    } catch {
      const conversation: Conversation = { id: contact.id + 1000, contactId: contact.id, title: contact.name }
      setSelectedConversation(conversation)
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation, unreadCount: 0 } : c))
    }
  }

  async function sendMessage({ conversationId, text }: { conversationId: number, text: string }) {
    const optimistic: Message = { id: Date.now(), conversationId, senderId: currentUserId, text, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])
    setContacts(prev => updatePreview(prev, optimistic))
    try {
      if (hasSupabase) {
        // invocar edge function de envío hacia WhatsApp
        await supabase.functions.invoke('send-message', { body: { conversation_id: conversationId, text } })
        return
      }
      await api.sendMessage({ conversationId, text })
    } catch {
      // mantener optimista
    }
  }

  return {
    contacts,
    selectedConversation,
    messages,
    selectContact,
    sendMessage,
    currentUserId,
    loading,
  }
}

function enrichContacts(list: Contact[]): Contact[] {
  return list.map((c, i) => ({
    ...c,
    online: Math.random() > 0.4,
    lastText: 'Último mensaje • vista previa',
    lastAt: 'hoy',
    unreadCount: i % 3 === 0 ? Math.ceil(Math.random() * 3) : 0,
  }))
}

function updatePreview(prev: Array<Contact & { conversation?: Conversation | null }>, msg: Message) {
  return prev.map(c => {
    if (c.conversation?.id === msg.conversationId) {
      return { ...c, lastText: msg.text, lastAt: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unreadCount: 0 }
    }
    return c
  })
} 