import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { Contact, Conversation, Message } from '../types'
// @ts-ignore
import { io, Socket } from 'socket.io-client'

export function useMessenger() {
  const [contacts, setContacts] = useState<Array<Contact & { conversation?: Conversation | null }>>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const currentUserId = 1
  const socketRef = useState<Socket | null>(null)[0]

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchInitial().finally(() => active && setLoading(false))

    async function fetchInitial() {
      const data = await api.getContacts()
      if (!active) return
      setContacts(data.map(c => ({ ...c, conversation: null })))
    }

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedConversation) return
    let active = true
    setLoading(true)
    api.getMessages(selectedConversation.id)
      .then((msgs) => { if (active) setMessages(msgs) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [selectedConversation?.id])

  useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])

  async function selectContact(contact: Contact) {
    const conversation = await api.ensureConversation(contact.id)
    setSelectedConversation(conversation)
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, conversation } : c))
  }

  async function sendMessage({ conversationId, text }: { conversationId: number, text: string }) {
    const created = await api.sendMessage({ conversationId, text })
    setMessages(prev => [...prev, created])
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