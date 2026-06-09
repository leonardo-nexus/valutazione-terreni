import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { InputValutazione, RisultatoValutazione } from '@/lib/valutazione/types'
import { eur, eur2, pct, num } from '@/lib/valutazione/format'
import { getLang, getDict } from '@/lib/i18n'
import PrintButton from './PrintButton'

export const metadata = { title: 'Investment Memo' }

function Riga({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-200 py-1">
      <span className="text-neutral-500">{k}</span>
      <span className="font-medium text-neutral-900">{v}</span>
    </div>
  )
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('proenesys_valutazioni')
    .select('nome,input,risultato,updated_at')
    .eq('id', id)
    .single()
  if (!data) notFound()

  const lang = await getLang()
  const t = getDict(lang)
  const locale = lang === 'es' ? 'es-ES' : 'it-IT'
  const input = data.input as InputValutazione
  const r = data.risultato as RisultatoValutazione

  return (
    <div className="memo mx-auto max-w-3xl bg-white p-10 text-neutral-900">
      <style>{`
        @media print { .no-print { display: none !important; } @page { margin: 16mm; } }
        .memo { color-scheme: light; }
      `}</style>

      <div className="no-print mb-4 flex justify-end">
        <PrintButton auto label={t.btn.stampaSalva} />
      </div>

      <header className="mb-6 flex items-center justify-between border-b-2 border-[#a87f2e] pb-4">
        <div className="flex items-center gap-3">
          <Image src="/proenesys.png" alt="Proenesys" width={40} height={44} />
          <div>
            <div className="brand-font text-2xl font-semibold tracking-wide text-[#a87f2e]">PRO|ENESYS</div>
            <div className="text-xs text-neutral-500">{t.memo.titolo}</div>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-500">{new Date(data.updated_at).toLocaleDateString(locale)}</div>
      </header>

      <h1 className="mb-1 text-xl font-bold">{data.nome}</h1>
      <p className="mb-6 text-sm text-neutral-500">{input.terreno.comune || '—'} · {input.terreno.refCatastral || t.memo.rifNd}</p>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
        <span className="inline-block h-4 w-4 rounded-full" style={{ background: r.verdettoFinale.semaforo === 'VERDE' ? '#10b981' : r.verdettoFinale.semaforo === 'GIALLO' ? '#f59e0b' : '#ef4444' }} />
        <div>
          <div className="text-lg font-bold">{t.map.esito[r.verdettoFinale.esito] ?? r.verdettoFinale.esito}</div>
          <div className="text-sm text-neutral-600">{t.map.azione[r.verdettoFinale.esito] ?? r.verdettoFinale.azione}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
        <section>
          <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.memo.terrenoPrezzo}</h2>
          <Riga k={t.memo.superficie} v={`${num(input.terreno.superficieMq)} m²`} />
          <Riga k={t.f.statoTerreno} v={t.statoTerr[input.terreno.statoTerreno ?? 'libero']} />
          <Riga k={t.dash.prezzoRich} v={eur(input.terreno.prezzoRichiesto)} />
          <Riga k={t.dash.valorePreRisk} v={eur(r.residuale.valoreMaxPreRisk)} />
          <Riga k={t.dash.valoreRiskAdj} v={eur(r.residuale.valoreMaxRiskAdjusted)} />
          <Riga k={t.dash.prezzoTratt} v={eur(r.residuale.prezzoTrattativa)} />
          <Riga k={t.dash.scontoNec} v={pct(r.residuale.scontoNecessario)} />
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.dash.mercato}</h2>
          <Riga k={t.dash.compValidi} v={`${r.mercato.comparabiliValidi}`} />
          <Riga k={t.dash.mediaPond} v={eur2(r.mercato.mediaPonderata)} />
          <Riga k={t.dash.prezzoPrud} v={eur2(r.mercato.prezzoPrudente)} />
          <Riga k={t.dash.prezzoBanc} v={eur2(r.mercato.prezzoBancabile)} />
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.dash.ricaviCosti}</h2>
          <Riga k={t.dash.mqVend} v={num(r.ricavi.mqVendibili)} />
          <Riga k={t.dash.ricaviBase} v={eur(r.ricavi.ricaviBase)} />
          <Riga k={t.dash.ricaviPrudenti} v={eur(r.ricavi.ricaviPrudenti)} />
          <Riga k={t.dash.ricaviStress} v={eur(r.ricavi.ricaviStress)} />
          <Riga k={t.dash.costiEsclTerreno} v={eur(r.costi.totaleEsclusoTerreno)} />
          <Riga k={t.dash.costoTotIncl} v={eur(r.costi.totaleInclTerreno)} />
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.dash.cashflow}</h2>
          <Riga k={t.dash.van} v={eur(r.cashFlow.van)} />
          <Riga k={t.dash.prezzoMaxDin} v={eur(r.cashFlow.prezzoMaxDinamico)} />
          <Riga k={t.dash.tir} v={pct(r.cashFlow.tirAnnua)} />
          <Riga k={t.dash.maxEsp} v={eur(r.cashFlow.massimaEsposizione)} />
        </section>
      </div>

      <section className="mt-6 text-sm">
        <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.dash.stress}</h2>
        <div className="grid grid-cols-3 gap-3">
          {r.stress.map((s) => (
            <div key={s.nome} className="rounded border border-neutral-300 p-2">
              <div className="text-neutral-500">{s.nome}</div>
              <div className="font-medium">{eur(s.valoreMaxTerreno)}</div>
              <div style={{ color: s.verdetto === 'OK' ? '#10b981' : '#ef4444' }}>{s.verdetto}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 text-sm">
        <h2 className="mb-2 font-semibold text-[#a87f2e]">{t.dash.rischi}</h2>
        <Riga k={t.dash.statoRischio} v={t.map.risStato[r.rischi.stato] ?? r.rischi.stato} />
        <Riga k={t.dash.perditaAttesa} v={eur(r.rischi.perditaAttesaPonderata)} />
        <Riga k={t.dash.rischioLordo} v={eur(r.rischi.rischioLordoMassimo)} />
        {r.documentale.mancantiCritici.length > 0 && (
          <Riga k={t.dash.docMancanti} v={r.documentale.mancantiCritici.join(', ')} />
        )}
      </section>

      <footer className="mt-10 border-t border-neutral-300 pt-3 text-center text-xs text-neutral-400">
        {t.memo.riservato} · {t.memo.generato} {new Date().toLocaleDateString(locale)}
      </footer>
    </div>
  )
}
