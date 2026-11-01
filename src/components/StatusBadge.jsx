import { STATUS } from '../data/constants'

const SIZES = {
  sm: 'gap-1 px-2 py-0.5 text-[11px] [&_svg]:size-3',
  lg: 'gap-2 px-3.5 py-1.5 text-sm [&_svg]:size-4',
}

export default function StatusBadge({ status, size = 'sm' }) {
  const meta = STATUS[status]
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ring-1 ${meta.badge} ${SIZES[size]}`}>
      <Icon aria-hidden="true" />
      {meta.label}
    </span>
  )
}
