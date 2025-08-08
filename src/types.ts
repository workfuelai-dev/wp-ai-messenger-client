export type Contact = {
  id: number
  name: string
  phone?: string
  wa_id?: string
  avatarUrl?: string
  lastMessageAt?: string
  // UI/meta
  lastText?: string
  lastAt?: string
  unreadCount?: number
  online?: boolean
  pinned?: boolean
  archived?: boolean
}

export type Conversation = {
  id: number
  contactId: number
  title?: string | null
}

export type Message = {
  id: number
  conversationId: number
  senderId: number
  text: string
  createdAt: string
}

export type NewMessage = {
  conversationId: number
  text: string
} 