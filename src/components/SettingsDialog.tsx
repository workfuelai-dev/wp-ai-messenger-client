export function SettingsDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-4 top-4 w-[360px] max-w-[calc(100%-2rem)] rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
          <h3 className="font-medium">Ajustes</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">✕</button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Tema oscuro</span>
            <span className="text-zinc-500">Automático</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Notificaciones</span>
            <span className="text-zinc-500">Próximamente</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estado</span>
            <span className="text-zinc-500">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  )
} 