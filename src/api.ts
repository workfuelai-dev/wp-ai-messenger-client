import type { Contact, Conversation, Message, NewMessage } from './types'

const BASE = '/api'

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Error de red')
  }
  return res.json() as Promise<T>
}

export const api = {
  getContacts: () => http<Contact[]>(`${BASE}/contacts`),
  ensureConversation: (contactId: number) => http<Conversation>(`${BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactId }),
  }),
  getMessages: (conversationId: number) => http<Message[]>(`${BASE}/messages?conversationId=${conversationId}`),
  sendMessage: (payload: NewMessage) => http<Message>(`${BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
} 