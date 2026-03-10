import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null

  const getPages = () => {
    const arr = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) arr.push(i)
    return arr
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-card border border-surface-border hover:border-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages()[0] > 1 && (
        <>
          <button onClick={() => onChange(1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-card border border-surface-border hover:border-brand-500 text-sm transition-all">1</button>
          {getPages()[0] > 2 && <span className="text-ink-faint px-1">...</span>}
        </>
      )}

      {getPages().map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-all ${
            p === page
              ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
              : 'bg-surface-card border-surface-border hover:border-brand-500'
          }`}
        >
          {p}
        </button>
      ))}

      {getPages()[getPages().length - 1] < pages && (
        <>
          {getPages()[getPages().length - 1] < pages - 1 && <span className="text-ink-faint px-1">...</span>}
          <button onClick={() => onChange(pages)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-card border border-surface-border hover:border-brand-500 text-sm transition-all">{pages}</button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-card border border-surface-border hover:border-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Pagination

