import { Search, LoaderCircle, History, X } from 'lucide-react'
import { formatAsTyped, formatPhone } from '../utils/phone'

const EXAMPLES = [
  { label: '(11) 90001-4471', value: '11900014471' },
  { label: '(41) 90005-2286', value: '41900052286' },
  { label: '(11) 98888-1234', value: '11988881234' },
  { label: 'DDD 11', value: '11' },
]

const labelFor = (value) => (value.length === 2 ? `DDD ${value}` : formatPhone(value))

export default function SearchPanel({ value, onChange, onSearch, loading, recent = [], onClearRecent, showExamples }) {
  const submit = (query) => {
    if (!query.trim() || loading) return
    onSearch(query)
  }

  const chips = recent.length ? recent.map((v) => ({ label: labelFor(v), value: v })) : showExamples ? EXAMPLES : []

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
        role="search"
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="busca" className="sr-only">Número de telefone ou DDD</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            id="busca"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="(11) 98765-4321"
            value={value}
            onChange={(e) => onChange(formatAsTyped(e.target.value))}
            className="field h-16 pl-13 font-mono text-2xl placeholder:font-mono sm:text-[1.6rem] sm:tracking-wide"
          />
        </div>
        <button type="submit" disabled={loading || !value} className="btn btn-primary h-16 px-7 text-lg">
          {loading ? <LoaderCircle className="size-5 animate-spin" /> : <Search className="size-5" />}
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </form>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            {recent.length ? <><History className="size-4" /> Pesquisas recentes:</> : 'Experimente:'}
          </span>
          {chips.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(formatAsTyped(c.value))
                submit(c.value)
              }}
              className="chip font-mono"
            >
              {c.label}
            </button>
          ))}
          {recent.length > 0 && (
            <button type="button" onClick={onClearRecent} className="btn btn-ghost px-2 py-1 text-sm font-medium">
              <X className="size-4" /> Limpar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
