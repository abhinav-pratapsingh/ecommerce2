import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ className = '', placeholder = 'Search products, brands...' }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative group ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint group-focus-within:text-brand-500 transition-colors" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}

export default SearchBar

