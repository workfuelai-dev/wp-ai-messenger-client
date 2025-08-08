import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Contact, Conversation, Message } from '../types'
// @ts-ignore
import { io, Socket } from 'socket.io-client'
import { supabase } from '../lib/supabase'

export function useMessenger() {
  const [contacts, setContacts] = useState<Array<Contact & { conversation?: Conversation | null }>>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const currentUserId = 1
  const socketRef = useState<Socket | null>(null)[0]
  const isStatic = typeof window !== 'undefined' && location.hostname.endsWith('github.io')
  const hasSupabase = Boolean(supabase)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchInitial().finally(() => active && setLoading(false))

    async function fetchInitial() {
      try {
        if (hasSupabase) {
          console.log('Cargando datos desde Supabase...')
          // Intentar leer contactos desde tablas (contacts) directamente
          const { data: contacts, error: contactsError } = await (supabase as any)
            .from('contacts')
            .select('id, name, phone, wa_id')
            .limit(50)
          
          if (contactsError) {
            console.error('Error cargando contactos:', contactsError)
            setContacts([])
            return
          }
          
          console.log('Contactos cargados:', contacts)
          
          if (!contacts || contacts.length === 0) {
            console.log('No hay contactos, mostrando lista vacía')
            setContacts([])
            return
          }
          
          // Para cada contacto, obtener su conversación
          const contactsWithConversations = await Promise.all(
            contacts.map(async (contact: any) => {
              const { data: convs } = await (supabase as any)
                .from('conversations')
                .select('id')
                .eq('contact_id', contact.id)
                .limit(1)
              
              return {
                ...contact,
                conversation: convs?.[0] ? { 
                  id: convs[0].id, 
                  contactId: contact.id, 
                  title: contact.name 
                } : null
              }
            })
          )
          
          setContacts(enrichContacts(contactsWithConversations))
          return
        }
        
        // Fallback a API local si no hay Supabase
        const data = await api.getContacts()
        setContacts(enrichContacts(data).map(c => ({ ...c, conversation: null })))
      } catch (err) {
        console.error('Error cargando datos:', err)
        // NO cargar mock data, dejar lista vacía
        setContacts([])
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
          console.log(`Cargando mensajes para conversación ${selectedConversation.id}`)
          const { data: msgs, error } = await (supabase as any)
            .from('messages')
            .select('id, conversation_id, sender_id, text, created_at, wa_message_id')
            .eq('conversation_id', selectedConversation.id)
            .order('created_at', { ascending: true })
          
          if (error) {
            console.error('Error cargando mensajes:', error)
            if (active) setMessages([])
            return
          }
          
          console.log('Mensajes cargados:', msgs)
          
          const normalized: Message[] = (msgs || []).map((m: any) => ({
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
      } catch (err) {
        console.error('Error cargando mensajes:', err)
        // NO cargar mensajes mock, dejar lista vacía
        if (active) setMessages([])
      } finally {
        if (active) setLoading(false)
      }
    })()

    // Realtime si hay supabase
    if (hasSupabase) {
      console.log(`Suscribiendo a cambios en conversación ${selectedConversation.id}`)
      const channel = (supabase as any)
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, (payload: any) => {
          console.log('Nuevo mensaje recibido vía realtime:', payload)
          const m = payload.new as any
          const msg: Message = { id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, text: m.text, createdAt: m.created_at }
          setMessages(prev => [...prev, msg])
        })
        .subscribe()
      return () => { (supabase as any).removeChannel(channel) }
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
        console.log(`Seleccionando contacto ${contact.id} - ${contact.name}`)
        // asegurar conversación existente o crearla
        const { data: existing } = await (supabase as any)
          .from('conversations')
          .select('id')
          .eq('contact_id', contact.id)
          .maybeSingle()
        let convId = existing?.id
        if (!convId) {
          console.log(`Creando nueva conversación para contacto ${contact.id}`)
          const { data: created, error } = await (supabase as any)
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
    } catch (err) {
      console.error('Error seleccionando contacto:', err)
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
        console.log(`Enviando mensaje a conversación ${conversationId}:`, text)
        // invocar edge function de envío hacia WhatsApp
        const response = await (supabase as any).functions.invoke('send-message', { body: { conversation_id: conversationId, text } })
        console.log('Respuesta de send-message:', response)
        return
      }
      await api.sendMessage({ conversationId, text })
    } catch (err) {
      console.error('Error enviando mensaje:', err)
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
  return list.map((c) => ({
    ...c,
    online: Math.random() > 0.4,
    lastText: 'Conversación iniciada',
    lastAt: 'ahora',
    unreadCount: 0, // No mostrar badges falsos
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