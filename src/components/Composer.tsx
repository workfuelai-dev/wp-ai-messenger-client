import { useState } from 'react'
import { Smile, Paperclip, Mic, Send, Circle } from 'lucide-react'

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)

  function send() {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  async function startVoice() {
    // Intento real de grabación; fallback si no se permite
    try {
      setRecording(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        setRecording(false)
        // Demo: no subimos el blob; enviamos un placeholder
        onSend('🎤 Mensaje de voz (demo)')
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      // Detener automáticamente a los 3s en demo
      setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), 3000)
    } catch {
      setRecording(false)
      onSend('🎤 Mensaje de voz')
    }
  }

  const isEmpty = text.trim().length === 0

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
              if (isEmpty) startVoice()
              else send()
            }
          }}
          placeholder="Escribe un mensaje"
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none leading-6 max-h-40"
        />
        {recording && (
          <span className="text-[12px] text-rose-500 inline-flex items-center gap-1">
            <Circle size={8} className="fill-rose-500 text-rose-500" /> Grabando...
          </span>
        )}
      </div>
      <button
        onClick={() => (isEmpty ? startVoice() : send())}
        title={isEmpty ? 'Grabar audio' : 'Enviar mensaje'}
        className={`h-10 px-4 rounded-full text-white flex items-center justify-center ${isEmpty ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'}`}
      >
        {isEmpty ? <Mic size={18} /> : <Send size={16} />}
      </button>
    </div>
  )
} 