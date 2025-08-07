import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Contact, Conversation, Message } from '../types'
// @ts-ignore
import { io, Socket } from 'socket.io-client'

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

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchInitial().finally(() => active && setLoading(false))

    async function fetchInitial() {
      try {
        const data = await api.getContacts()
        if (!active) return
        setContacts(data.map(c => ({ ...c, conversation: null })))
      } catch {
        // Fallback para GH Pages sin backend
        if (!active) return
        setContacts(mockContacts.map(c => ({ ...c, conversation: null })))
      }
    }

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedConversation) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const msgs = await api.getMessages(selectedConversation.id)
        if (active) setMessages(msgs)
      } catch {
        if (active) setMessages([
          { id: 1, conversationId: selectedConversation.id, senderId: 2, text: 'Previsualización de conversación.', createdAt: new Date(Date.now() - 600000).toISOString() },
          { id: 2, conversationId: selectedConversation.id, senderId: 1, text: 'Hola 👋', createdAt: new Date(Date.now() - 300000).toISOString() },
        ])
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => { active = false }
  }, [selectedConversation?.id])

  useEffect(() => {
    if (isStatic) return // no socket en GH Pages
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
      })
      return () => { s.disconnect() }
    } catch {
      // ignorar
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])

  async function selectContact(contact: Contact) {
    try {
      const conversation = await api.ensureConversation(contact.id)
      setSelectedConversation(conversation)
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation } : c))
    } catch {
      const conversation: Conversation = { id: contact.id + 1000, contactId: contact.id, title: contact.name }
      setSelectedConversation(conversation)
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation } : c))
    }
  }

  async function sendMessage({ conversationId, text }: { conversationId: number, text: string }) {
    try {
      const created = await api.sendMessage({ conversationId, text })
      setMessages(prev => [...prev, created])
    } catch {
      const created: Message = { id: Date.now(), conversationId, senderId: currentUserId, text, createdAt: new Date().toISOString() }
      setMessages(prev => [...prev, created])
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