import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { eur } from '@/lib/valutazione/format'
import { eliminaValutazione } from '@/app/actions/valutazione'
import { getLang, getDict } from '@/lib/i18n'

export async function generateMetadata() {
  const t = getDict(await getLang())
  return { title: `Proenesys · ${t.arch.titolo}` }
}

type Row = {
  id: string
  nome: string
  comune: string | null
  prezzo_richiesto: number | null
  esito: string | null
  valore_max: number | null
  updated_at: string
}

const semaforo = (esito: string | null) =>
  esito === 'INVESTIBILE CON DISCIPLINA' ? 'bg-emerald-500' : esito === 'TRATTARE CON SCONTO' ? 'bg-amber-400' : 'bg-red-500'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const lang = await getLang()
  const t = getDict(lang)
  const locale = lang === 'es' ? 'es-ES' : 'it-IT'

  const { data } = await supabase
    .from('proenesys_valutazioni')
    .select('id,nome,comune,prezzo_richiesto,esito,valore_max,updated_at')
    .order('updated_at', { ascending: false })
  const rows = (data ?? []) as Row[]

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="section-title">{t.arch.archivio}</p>
          <h1 className="brand-font mt-1 text-3xl font-semibold">{t.arch.titolo}</h1>
        </div>
        <Link href="/valuta" className="gold-btn px-4 py-2.5 text-sm">{t.btn.nuova}</Link>
      </div>

      {rows.length === 0 && <p className="text-sm text-[var(--muted)]">{t.arch.nessuna}</p>}

      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.id} className="panel flex items-center gap-4 p-4">
            <span className={`h-3 w-3 shrink-0 rounded-full ${semaforo(r.esito)}`} />
            <div className="min-w-0 flex-1">
              <Link href={`/valutazioni/${r.id}`} className="font-medium hover:text-[var(--gold)]">{r.nome}</Link>
              <div className="text-xs text-[var(--muted)]">
                {r.comune || '—'} · {t.arch.richiesto} {eur(r.prezzo_richiesto ?? 0)} · {new Date(r.updated_at).toLocaleString(locale)}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-xs text-[var(--muted)]">{t.arch.valoreMax}</div>
              <div className="font-semibold">{eur(r.valore_max ?? 0)}</div>
            </div>
            <div className="text-xs">{(t.map.esito as Record<string, string>)[r.esito ?? ''] ?? r.esito}</div>
            <Link href={`/valutazioni/${r.id}/stampa`} target="_blank" className="gold-link text-sm">{t.btn.pdf}</Link>
            <Link href={`/valutazioni/${r.id}`} className="text-sm text-[var(--muted)] hover:text-[var(--gold)]">{t.btn.apri}</Link>
            <form action={eliminaValutazione.bind(null, r.id)}>
              <button className="text-sm text-[var(--muted)] hover:text-red-400">{t.btn.elimina}</button>
            </form>
          </div>
        ))}
      </div>
    </main>
  )
}
