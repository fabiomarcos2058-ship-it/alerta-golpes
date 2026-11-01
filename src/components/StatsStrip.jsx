import { Database, PhoneCall, Activity } from 'lucide-react'

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('pt-BR') : '—')

export default function StatsStrip({ stats, isDemo }) {
  const items = [
    { icon: Database, label: 'denúncias na base', value: stats?.total },
    { icon: PhoneCall, label: 'números denunciados', value: stats?.numbers },
    { icon: Activity, label: 'nas últimas 24 h', value: stats?.last24h },
  ]
  return (
    <div>
      <dl className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border border-white/5 bg-white/[0.02]">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="px-3 py-3 text-center sm:px-5">
            <dt className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 sm:text-xs">
              <Icon className="hidden size-3.5 sm:block" />
              {label}
            </dt>
            <dd className="mt-0.5 font-display text-xl font-bold text-white tabular-nums sm:text-2xl">{fmt(value)}</dd>
          </div>
        ))}
      </dl>
      {isDemo && (
        <p className="mt-2 text-center text-[11px] text-slate-500">Modo demonstração: todos os números são fictícios.</p>
      )}
    </div>
  )
}
