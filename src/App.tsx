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
    <div className="h-full">
      <div className="mx-auto max-w-[1400px] h-full p-0 md:p-6">
        <div className="h-screen md:h-[calc(100vh-3rem)] grid grid-cols-[360px_1fr] bg-zinc-100 dark:bg-zinc-800 rounded-none md:rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60">
          <aside className="bg-white dark:bg-zinc-900 border-r border-zinc-200/60 dark:border-zinc-800/60 flex flex-col">
            <Sidebar
              contacts={contacts}
              onSelectContact={selectContact}
              activeConversationId={selectedConversation?.id}
              loading={loading}
            />
          </aside>
          <main className="bg-zinc-50 dark:bg-zinc-900 chat-bg flex flex-col">
            <Chat
              conversation={selectedConversation}
              messages={messages}
              onSend={(text: string) => {
                if (!selectedConversation) return
                sendMessage({ conversationId: selectedConversation.id, text })
              }}
              currentUserId={currentUserId}
              loading={loading}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
