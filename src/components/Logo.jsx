// Marca do Alerta Golpe: escudo azul com um telefone tocando.
const SHIELD = 'M60 5C73 12 88 15 104 15C106 15 107 16 107 18V55C107 85 88 104 61.5 115.4C60.5 115.8 59.5 115.8 58.5 115.4C32 104 13 85 13 55V18C13 16 14 15 16 15C32 15 47 12 60 5Z'
const SHIELD_LEFT = 'M60 5C47 12 32 15 16 15C14 15 13 16 13 18V55C13 85 32 104 58.5 115.4C59 115.6 59.5 115.7 60 115.7Z'

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path d={SHIELD} fill="#1F4FD8" />
      <path d={SHIELD_LEFT} fill="#3B6CF2" />
      <g transform="translate(33 30) scale(2.25)" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2a9 9 0 0 1 9 9" />
        <path d="M13 6a5 5 0 0 1 5 5" />
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      </g>
    </svg>
  )
}

export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-9" />
      <span className={`text-[1.3rem] font-extrabold tracking-[-0.01em] whitespace-nowrap text-ink ${compact ? 'hidden min-[380px]:inline' : ''}`}>
        Alerta Golpe
      </span>
    </span>
  )
}
