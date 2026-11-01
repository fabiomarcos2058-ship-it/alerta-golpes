import { Search, LoaderCircle } from 'lucide-react'
import { formatAsTyped } from '../utils/phone'

const EXAMPLES = [
  { label: '(11) 90001-4471', value: '11900014471', tone: 'text-red-300' },
  { label: '(41) 90005-2286', value: '41900052286', tone: 'text-amber-200' },
  { label: '(11) 98888-1234', value: '11988881234', tone: 'text-emerald-300' },
  { label: 'DDD 11', value: '11', tone: 'text-cyan-200' },
]

export default function SearchPanel({ value, onChange, onSearch, loading }) {
  const setValue = onChange

  const submit = (query) => {
    if (!query.trim() || loading) return
    onSearch(query)
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
        className="group relative flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/90 p-2 shadow-2xl shadow-cyan-950/40 ring-cyan-400/40 transition focus-within:border-cyan-400/50 focus-within:ring-4 focus-within:ring-cyan-400/10"
        role="search"
      >
        <Search className="ml-2 size-5 shrink-0 text-slate-500 group-focus-within:text-cyan-300" aria-hidden="true" />
        <label htmlFor="busca" className="sr-only">Número de telefone ou DDD</label>
        <input
          id="busca"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="(11) 98765-4321 ou só o DDD"
          value={value}
          onChange={(e) => setValue(formatAsTyped(e.target.value))}
          className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-base text-white placeholder:font-sans placeholder:text-slate-500 focus:outline-none sm:text-lg"
        />
        <button
          type="submit"
          disabled={loading || !value}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4 sm:hidden" />}
          <span className="hidden sm:inline">{loading ? 'Consultando…' : 'Verificar'}</span>
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Experimente:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.value}
            type="button"
            onClick={() => {
              setValue(formatAsTyped(ex.value))
              submit(ex.value)
            }}
            className={`rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono transition hover:border-white/25 hover:bg-white/[0.06] ${ex.tone}`}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
