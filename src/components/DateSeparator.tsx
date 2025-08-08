export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center my-3">
      <div className="flex-1 h-px bg-zinc-200/70 dark:bg-zinc-700/50" />
      <span className="mx-3 text-[11px] px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300">{label}</span>
      <div className="flex-1 h-px bg-zinc-200/70 dark:bg-zinc-700/50" />
    </div>
  )
} 