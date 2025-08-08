import { useState } from 'react'
import { Smile, Paperclip, Mic, Send } from 'lucide-react'

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  function send() {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <div className="flex items-end gap-2">
      <button title="Emoji" className="hidden sm:inline-flex h-10 w-10 rounded-full grid place-items-center hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <Smile size={18} />
      </button>
      <div className="flex-1 flex items-center gap-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-700/60 px-3 py-2">
        <button title="Adjuntar" className="h-8 w-8 rounded-full grid place-items-center hover:bg-zinc-200/60 dark:hover:bg-zinc-800">
          <Paperclip size={18} />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Escribe un mensaje"
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none leading-6 max-h-40"
        />
      </div>
      <button onClick={send} title="Enviar" className="h-10 px-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 flex items-center gap-2">
        <Send size={16} />
        <span className="hidden sm:inline">Enviar</span>
      </button>
      <button title="Voz" className="hidden sm:inline-flex h-10 w-10 rounded-full grid place-items-center hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <Mic size={18} />
      </button>
    </div>
  )
} 