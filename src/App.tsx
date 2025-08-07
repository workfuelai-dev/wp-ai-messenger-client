import { useState } from 'react'
import './index.css'
import { Sidebar } from './components/Sidebar'
import { Chat } from './components/Chat'
import { useMessenger } from './store/useMessenger'

function App() {
  const {
    contacts,
    selectedConversation,
    messages,
    selectContact,
    sendMessage,
    currentUserId,
    loading,
  } = useMessenger()

  return (
    <div className="min-h-screen h-full">
      <div className="mx-auto max-w-7xl h-screen p-4 sm:p-6">
        <div className="grid h-full grid-cols-1 md:grid-cols-[320px,1fr] gap-4">
          <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 overflow-hidden flex flex-col">
            <Sidebar
              contacts={contacts}
              onSelectContact={selectContact}
              activeConversationId={selectedConversation?.id}
              loading={loading}
            />
          </div>
          <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 overflow-hidden flex flex-col">
            <Chat
              conversation={selectedConversation}
              messages={messages}
              onSend={(text) => {
                if (!selectedConversation) return
                sendMessage({ conversationId: selectedConversation.id, text })
              }}
              currentUserId={currentUserId}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
