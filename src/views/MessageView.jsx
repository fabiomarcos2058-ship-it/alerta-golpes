import { useState } from 'react'
import { ShieldX, ShieldAlert, ShieldCheck, ClipboardPaste, Eraser, Lock, ScanSearch } from 'lucide-react'
import { analyzeMessage, EXAMPLES, LEVELS } from '../lib/analyzeMessage'

const TONE = {
  danger: { icon: ShieldX, box: 'border-danger/25 bg-danger-tint', text: 'text-danger' },
  warn: { icon: ShieldAlert, box: 'border-warn/25 bg-warn-tint', text: 'text-warn' },
  safe: { icon: ShieldCheck, box: 'border-safe/25 bg-safe-tint', text: 'text-safe' },
}

export default function MessageView() {
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [pasteError, setPasteError] = useState('')

  const run = (value = text) => {
    if (!value.trim()) return
    setAnalysis(analyzeMessage(value))
  }

  const paste = async () => {
    setPasteError('')
    try {
      const value = await navigator.clipboard.readText()
      setText(value)
      run(value)
    } catch {
      setPasteError('Não foi possível colar automaticamente. Toque e segure no campo e escolha "Colar".')
    }
  }

  const level = analysis && LEVELS[analysis.level]
  const tone = level && TONE[level.tone]

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[2.25rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">Recebeu uma mensagem estranha?</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Cole o SMS ou a mensagem de WhatsApp aqui. Mostramos os sinais de golpe que aparecem no texto.
        </p>
        <p className="mt-2 flex items-center gap-2 text-[15px] text-ink-soft">
          <Lock className="size-4 text-safe" /> A análise acontece no seu aparelho. O texto não é enviado para ninguém.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <label htmlFor="msg" className="label">Texto da mensagem</label>
        <textarea
          id="msg"
          rows={6}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setAnalysis(null)
          }}
          placeholder="Cole aqui a mensagem que você recebeu…"
          className="field resize-y leading-relaxed"
        />
        {pasteError && <p className="mt-2 text-sm text-danger">{pasteError}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => run()} disabled={!text.trim()} className="btn btn-primary">
            <ScanSearch className="size-5" /> Analisar mensagem
          </button>
          <button type="button" onClick={paste} className="btn btn-secondary">
            <ClipboardPaste className="size-5" /> Colar
          </button>
          {text && (
            <button type="button" onClick={() => { setText(''); setAnalysis(null) }} className="btn btn-ghost">
              <Eraser className="size-5" /> Limpar
            </button>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-soft">Ver um exemplo:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" className="chip" onClick={() => { setText(ex.text); run(ex.text) }}>
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {analysis && (
        <section className="animate-rise space-y-5" aria-live="polite">
          <div className={`flex items-start gap-4 rounded-2xl border p-5 sm:p-6 ${tone.box}`}>
            <tone.icon className={`mt-0.5 size-9 shrink-0 ${tone.text}`} strokeWidth={2.2} />
            <div>
              <p className={`text-2xl font-extrabold ${tone.text}`}>{level.label}</p>
              <p className="mt-1 text-ink">
                {analysis.level === 'baixo'
                  ? 'Mesmo assim, desconfie de qualquer pedido de dinheiro, senha ou código, e confira por outro caminho.'
                  : 'Não responda, não clique em links e não passe códigos. Se envolver alguém conhecido, ligue para o número antigo da pessoa.'}
              </p>
            </div>
          </div>

          {analysis.found.length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-ink">{analysis.level === 'baixo' ? 'Pontos para observar' : 'Sinais de golpe encontrados'}</h2>
              <ul className="mt-3 divide-y divide-line">
                {analysis.found.map((f) => (
                  <li key={f.id} className="py-3">
                    <p className="font-semibold text-ink">{f.title}</p>
                    <p className="text-ink-soft">{f.text}</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      No texto: {f.hits.slice(0, 4).map((h) => `“${h}”`).join(', ')}
                    </p>
                  </li>
                ))}
              </ul>

              <h3 className="mt-5 mb-2 font-semibold text-ink">A mensagem, com os trechos marcados</h3>
              <p className="rounded-xl bg-paper p-4 leading-relaxed whitespace-pre-wrap text-ink">
                {analysis.segments.map((s, i) =>
                  s.mark ? (
                    <mark key={i} className="rounded bg-amber-200 px-0.5 text-ink">{s.text}</mark>
                  ) : (
                    <span key={i}>{s.text}</span>
                  )
                )}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
