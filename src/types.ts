export type Contact = {
  id: number
  name: string
  avatarUrl?: string
  lastMessageAt?: string
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