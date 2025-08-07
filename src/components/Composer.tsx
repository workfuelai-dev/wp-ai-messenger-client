import { useState } from 'react'

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  function send() {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder="Escribe un mensaje"
        className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-700/60 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button onClick={send} className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700">Enviar</button>
    </div>
  )
} 