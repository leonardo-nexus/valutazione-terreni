'use client'

import { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { runValutazione, salvaValutazione } from '@/app/actions/valutazione'
import type { InputValutazione, RisultatoValutazione, StatoDocumento } from '@/lib/valutazione/types'
import { eur, eur2, pct, num } from '@/lib/valutazione/format'
import type { Guida, GuidaKey } from '@/lib/valutazione/guide'
import type { Dict } from '@/lib/i18n'

const clone = (x: InputValutazione): InputValutazione => JSON.parse(JSON.stringify(x))
const STATI: StatoDocumento[] = ['Completo', 'Mancante', 'Da verificare', 'Non applicabile']
const STATI_RIS = ['Aperto', 'Da verificare', 'Chiuso', 'Bloccante'] as const
const BASI = ['manuale', 'eur_mq_techo', 'eur_mq_sotterraneo', 'eur_mq_vendibile', 'pct_hard', 'pct_hard_soft', 'pct_ricavi', 'pct_terreno'] as const
const inputCls = 'field-input'
const r6 = (n: number) => Math.round(n * 1e6) / 1e6

// ---- helper UI a livello di modulo (stabili: NON ricreati a ogni render) ----
type GuideLabels = { cosa: string; perche: string; dove: string }
const GuideCtx = createContext<{ guide: Record<GuidaKey, Guida>; labels: GuideLabels } | null>(null)

function Info({ k }: { k: GuidaKey }) {
  const ctx = useContext(GuideCtx)
  const [open, setOpen] = useState(false)
  const g = ctx?.guide[k]
  if (!g || !ctx) return null
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label="?"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-gold)] text-[10px] font-bold text-[var(--gold)] hover:bg-[rgba(201,162,75,0.12)]"
      >
        i
      </button>
      {open && (
        <span className="absolute left-5 top-0 z-50 block w-64 rounded-lg border border-[var(--border-gold)] bg-[#15130f] p-3 text-xs shadow-xl">
          <span className="mb-1 block"><span className="font-semibold text-[var(--gold)]">{ctx.labels.cosa}: </span><span className="text-[var(--text)]">{g.cosa}</span></span>
          <span className="mb-1 block"><span className="font-semibold text-[var(--gold)]">{ctx.labels.perche}: </span><span className="text-[var(--muted)]">{g.perche}</span></span>
          <span className="block"><span className="font-semibold text-[var(--gold)]">{ctx.labels.dove}: </span><span className="text-[var(--muted)]">{g.dove}</span></span>
        </span>
      )}
    </span>
  )
}

// Formato IT/ES: virgola = decimale, punto = migliaia (ignorato in input).
const toDisplay = (n: number) => (n === 0 ? '' : String(n).replace('.', ','))
function sanitizeComma(raw: string): string {
  let s = raw.replace(/[^\d,-]/g, '') // togli punti (migliaia), spazi, lettere; tieni cifre/virgola/meno
  const neg = s.startsWith('-')
  s = s.replace(/-/g, '')
  const parts = s.split(',')
  s = parts.shift() ?? ''
  if (parts.length) s += ',' + parts.join('') // una sola virgola decimale
  s = s.replace(/^0+(?=\d)/, '') // niente zeri iniziali
  return (neg ? '-' : '') + s
}
const parseComma = (s: string): number => {
  if (s === '' || s === '-' || s === ',') return 0
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

// Input numerico: mostra la virgola decimale, seleziona tutto al focus, niente zeri iniziali.
function NumberField({ value, onChange, className }: { value: number; onChange: (n: number) => void; step?: string; className?: string }) {
  const [text, setText] = useState<string>(() => toDisplay(value))
  const last = useRef(value)
  useEffect(() => {
    if (value !== last.current) { setText(toDisplay(value)); last.current = value }
  }, [value])
  const handle = (raw: string) => {
    const s = sanitizeComma(raw)
    setText(s)
    const n = parseComma(s)
    last.current = n
    onChange(n)
  }
  return (
    <input type="text" inputMode="decimal" className={className} placeholder="0" value={text}
      onFocus={(e) => e.currentTarget.select()} onChange={(e) => handle(e.target.value)} />
  )
}

// Input percentuale: l'utente scrive il numero intero (20 = 20%); il modello memorizza 0,20.
function PercentField({ value, onChange, className }: { value: number; onChange: (n: number) => void; className?: string }) {
  const [text, setText] = useState<string>(() => toDisplay(r6(value * 100)))
  const last = useRef(value)
  useEffect(() => {
    if (value !== last.current) { setText(toDisplay(r6(value * 100))); last.current = value }
  }, [value])
  const handle = (raw: string) => {
    const s = sanitizeComma(raw)
    setText(s)
    const dec = r6(parseComma(s) / 100)
    last.current = dec
    onChange(dec)
  }
  return (
    <input type="text" inputMode="decimal" className={className} placeholder="0" value={text}
      onFocus={(e) => e.currentTarget.select()} onChange={(e) => handle(e.target.value)} />
  )
}

function Field({ label, help, children }: { label: string; help?: GuidaKey; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center gap-1.5 text-[var(--muted)]">{label} {help && <Info k={help} />}</span>
      {children}
    </label>
  )
}

function Section({ title, help, children }: { title: string; help?: GuidaKey; children: React.ReactNode }) {
  return (
    <section className="panel p-5">
      <h2 className="section-title mb-4 flex items-center gap-2">{title} {help && <Info k={help} />}</h2>
      {children}
    </section>
  )
}

export default function Valutatore({
  t,
  guide,
  defaultInput,
  initial,
}: {
  t: Dict
  guide: Record<GuidaKey, Guida>
  defaultInput: InputValutazione
  initial?: { id: string; nome: string; input: InputValutazione }
}) {
  const [inp, setInp] = useState<InputValutazione>(() => clone(initial?.input ?? defaultInput))
  const [res, setRes] = useState<RisultatoValutazione | null>(null)
  const [pending, start] = useTransition()
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [savedId, setSavedId] = useState<string | undefined>(initial?.id)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [dirty, setDirty] = useState(false)

  // Se il modulo è ancora intatto (nuova valutazione, nessuna modifica), al cambio
  // lingua i dati di default si ri-traducono. Se l'utente ha già scritto, si preservano.
  useEffect(() => {
    if (!initial && !dirty) setInp(clone(defaultInput))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInput])

  const patch = (fn: (d: InputValutazione) => void) =>
    setInp((prev) => {
      const d = clone(prev)
      fn(d)
      setRes(null)
      setSavedMsg('')
      setDirty(true)
      return d
    })

  const calcola = () => start(async () => setRes(await runValutazione(inp)))

  const salva = async () => {
    setSaving(true)
    setSavedMsg('')
    try {
      const id = await salvaValutazione({ id: savedId, nome, input: inp })
      setSavedId(id)
      setSavedMsg(t.msg.salvata)
    } catch (e) {
      setSavedMsg(t.msg.erroreSalva + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const semaforoColor =
    res?.verdettoFinale.semaforo === 'VERDE' ? 'bg-emerald-500' : res?.verdettoFinale.semaforo === 'GIALLO' ? 'bg-amber-400' : 'bg-red-500'

  const needDemol =
    (inp.terreno.statoTerreno ?? 'libero') !== 'libero' &&
    !inp.costi.some((c) => /(demoliz|demolic|bonific|sanea)/i.test(c.voce) && c.valore > 0)

  const catasto = inp.terreno.superficieCatastoMq ?? 0
  const needSurfaceWarn = catasto > 0 && inp.terreno.superficieMq > 0 && Math.abs(catasto - inp.terreno.superficieMq) > 0.5
  const needEdifWarn = inp.urbanistica.edificabilita > 5

  const ASSUNZIONI: [string, keyof InputValutazione['assunzioni'] & GuidaKey][] = [
    [t.f.margineProm, 'margineProm'], [t.f.premioRischio, 'premioRischio'], [t.f.haircut, 'haircut'],
    [t.f.scontoCommerciale, 'scontoCommerciale'], [t.f.preVenditaPct, 'preVenditaPct'], [t.f.tassoSconto, 'tassoSconto'],
    [t.f.tassoFinanziamento, 'tassoFinanziamento'], [t.f.tirMin, 'tirMin'],
  ]

  return (
    <GuideCtx.Provider value={{ guide, labels: t.guideLabels }}>
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(360px,420px)]">
      {/* ---------------- FORM ---------------- */}
      <div className="flex flex-col gap-5">
        <Section title={t.sec.terreno}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t.f.comune} help="comune">
              <input className={inputCls} value={inp.terreno.comune} onChange={(e) => patch((d) => (d.terreno.comune = e.target.value))} />
            </Field>
            <Field label={t.f.refCat} help="refCatastral">
              <input className={inputCls} value={inp.terreno.refCatastral ?? ''} onChange={(e) => patch((d) => (d.terreno.refCatastral = e.target.value))} />
            </Field>
            <Field label={t.f.superficie} help="superficieMq">
              <NumberField className={inputCls} value={inp.terreno.superficieMq} onChange={(n) => patch((d) => (d.terreno.superficieMq = n))} />
            </Field>
            <Field label={t.f.superficieCatasto} help="superficieCatastoMq">
              <NumberField className={inputCls} value={inp.terreno.superficieCatastoMq ?? 0} onChange={(n) => patch((d) => (d.terreno.superficieCatastoMq = n))} />
            </Field>
            <Field label={t.f.prezzo} help="prezzoRichiesto">
              <NumberField className={inputCls} value={inp.terreno.prezzoRichiesto} onChange={(n) => patch((d) => (d.terreno.prezzoRichiesto = n))} />
            </Field>
            <Field label={t.f.statoTerreno} help="statoTerreno">
              <select className={inputCls} value={inp.terreno.statoTerreno ?? 'libero'} onChange={(e) => patch((d) => (d.terreno.statoTerreno = e.target.value as 'libero' | 'edificato' | 'bonifica'))}>
                {(['libero', 'edificato', 'bonifica'] as const).map((s) => (
                  <option key={s} value={s}>{t.statoTerr[s]}</option>
                ))}
              </select>
            </Field>
          </div>
          {needSurfaceWarn && (
            <p className="mt-3 text-xs text-amber-400">
              ⚠ {t.msg.warnSuperfici} ({num(catasto, 2)} m² ↔ {num(inp.terreno.superficieMq, 2)} m²)
            </p>
          )}
          {needDemol && <p className="mt-3 text-xs text-amber-400">⚠ {t.msg.warnDemol}</p>}
        </Section>

        <Section title={t.sec.urbanistica}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t.f.classificazione} help="classificazioneSuolo">
              <select className={inputCls} value={inp.urbanistica.classificazioneSuolo} onChange={(e) => patch((d) => (d.urbanistica.classificazioneSuolo = e.target.value))}>
                {(['urbano', 'urbanizzabile', 'rustico', 'da_verificare'] as const).map((s) => (
                  <option key={s} value={s}>{t.classifOpt[s]}</option>
                ))}
              </select>
            </Field>
            <Field label={t.f.uso} help="usoConsentito">
              <select className={inputCls} value={inp.urbanistica.usoConsentito} onChange={(e) => patch((d) => (d.urbanistica.usoConsentito = e.target.value))}>
                {(['residenziale', 'terziario', 'commerciale', 'misto'] as const).map((s) => (
                  <option key={s} value={s}>{t.usoOpt[s]}</option>
                ))}
              </select>
            </Field>
            <Field label={t.f.edificabilita} help="edificabilita">
              <NumberField step="0.01" className={inputCls} value={inp.urbanistica.edificabilita} onChange={(n) => patch((d) => (d.urbanistica.edificabilita = n))} />
            </Field>
            <Field label={`${t.f.coeff} (%)`} help="coeffVendibili">
              <PercentField className={inputCls} value={inp.urbanistica.coeffVendibili} onChange={(n) => patch((d) => (d.urbanistica.coeffVendibili = n))} />
            </Field>
            <Field label={t.f.mqSotterraneo} help="mqSotterraneo">
              <NumberField className={inputCls} value={inp.urbanistica.mqSotterraneo ?? 0} onChange={(n) => patch((d) => (d.urbanistica.mqSotterraneo = n))} />
            </Field>
            <Field label={t.f.numeroUnita} help="numeroUnita">
              <NumberField className={inputCls} value={inp.urbanistica.numeroUnita} onChange={(n) => patch((d) => (d.urbanistica.numeroUnita = n))} />
            </Field>
            <Field label={t.f.tempoLicenza} help="tempoLicenzaMesi">
              <NumberField className={inputCls} value={inp.urbanistica.tempoLicenzaMesi} onChange={(n) => patch((d) => (d.urbanistica.tempoLicenzaMesi = n))} />
            </Field>
          </div>
          {needEdifWarn && <p className="mt-3 text-xs text-amber-400">⚠ {t.msg.warnEdificabilita}</p>}
        </Section>

        <Section title={t.sec.assunzioni}>
          <div className="grid gap-3 sm:grid-cols-3">
            {ASSUNZIONI.map(([label, key]) => (
              <Field key={key} label={`${label} (%)`} help={key}>
                <PercentField className={inputCls} value={inp.assunzioni[key]} onChange={(n) => patch((d) => (d.assunzioni[key] = n))} />
              </Field>
            ))}
            <Field label={t.f.costoCostr} help="costoCostruzioneMqVendibile">
              <NumberField className={inputCls} value={inp.assunzioni.costoCostruzioneMqVendibile} onChange={(n) => patch((d) => (d.assunzioni.costoCostruzioneMqVendibile = n))} />
            </Field>
          </div>
        </Section>

        <Section title={t.sec.documenti} help="documenti">
          <div className="flex flex-col gap-2">
            {inp.checklist.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="flex-1">{doc.key ? t.docNames[doc.key] : doc.voce} {doc.critico && <span className="text-red-400">*</span>}</span>
                <select className={inputCls} value={doc.stato} onChange={(e) => patch((d) => (d.checklist[i].stato = e.target.value as StatoDocumento))}>
                  {STATI.map((s) => (<option key={s} value={s}>{t.statoDoc[s]}</option>))}
                </select>
              </div>
            ))}
            <p className="text-xs text-neutral-500">{t.docNota}</p>
          </div>
        </Section>

        <Section title={t.sec.comparabili} help="comparabili">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400">
                <tr className="text-left">
                  <th className="pb-2">{t.th.fonte}</th><th>{t.th.km}</th><th>{t.th.mq}</th><th>{t.th.prezzoE}</th><th>{t.th.affid}</th><th>{t.th.qual}</th><th>{t.th.incl}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {inp.comparabili.map((c, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2"><input className={inputCls + ' w-28'} value={c.fonte} onChange={(e) => patch((d) => (d.comparabili[i].fonte = e.target.value))} /></td>
                    <td><NumberField step="0.1" className={inputCls + ' w-14'} value={c.distanzaKm} onChange={(n) => patch((d) => (d.comparabili[i].distanzaKm = n))} /></td>
                    <td><NumberField className={inputCls + ' w-16'} value={c.superficieMq} onChange={(n) => patch((d) => (d.comparabili[i].superficieMq = n))} /></td>
                    <td><NumberField className={inputCls + ' w-24'} value={c.prezzo} onChange={(n) => patch((d) => (d.comparabili[i].prezzo = n))} /></td>
                    <td><PercentField className={inputCls + ' w-16'} value={c.affidabilita} onChange={(n) => patch((d) => (d.comparabili[i].affidabilita = n))} /></td>
                    <td><PercentField className={inputCls + ' w-16'} value={c.qualita} onChange={(n) => patch((d) => (d.comparabili[i].qualita = n))} /></td>
                    <td className="text-center"><input type="checkbox" checked={c.includi} onChange={(e) => patch((d) => (d.comparabili[i].includi = e.target.checked))} /></td>
                    <td><button className="text-neutral-500 hover:text-red-400" onClick={() => patch((d) => d.comparabili.splice(i, 1))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-sm gold-link" onClick={() => patch((d) => d.comparabili.push({ id: 'C' + (d.comparabili.length + 1), fonte: '', distanzaKm: 1, superficieMq: 100, prezzo: 0, includi: true, affidabilita: 0.8, qualita: 0.8 }))}>
            {t.btn.addComp}
          </button>
        </Section>

        <Section title={t.sec.costi} help="costi">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400"><tr className="text-left"><th className="pb-2">{t.th.voce}</th><th>{t.th.base}</th><th>{t.th.valore}</th><th></th></tr></thead>
              <tbody>
                {inp.costi.map((c, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2"><input className={inputCls + ' w-48'} value={c.voce} onChange={(e) => patch((d) => (d.costi[i].voce = e.target.value))} /></td>
                    <td><select className={inputCls} value={c.base} onChange={(e) => patch((d) => (d.costi[i].base = e.target.value as typeof c.base))}>{BASI.map((b) => <option key={b} value={b}>{t.basi[b]}</option>)}</select></td>
                    <td>
                      {c.base.startsWith('pct') ? (
                        <PercentField className={inputCls + ' w-28'} value={c.valore} onChange={(n) => patch((d) => (d.costi[i].valore = n))} />
                      ) : (
                        <NumberField className={inputCls + ' w-28'} value={c.valore} onChange={(n) => patch((d) => (d.costi[i].valore = n))} />
                      )}
                    </td>
                    <td><button className="text-neutral-500 hover:text-red-400" onClick={() => patch((d) => d.costi.splice(i, 1))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-sm gold-link" onClick={() => patch((d) => d.costi.push({ categoria: 'Altro', voce: '', base: 'manuale', valore: 0 }))}>{t.btn.addCosto}</button>
        </Section>

        <Section title={t.sec.rischi} help="rischi">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400"><tr className="text-left"><th className="pb-2">{t.th.rischio}</th><th>{t.th.prob}</th><th>{t.th.impatto}</th><th>{t.th.stato}</th><th></th></tr></thead>
              <tbody>
                {inp.rischi.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2"><input className={inputCls + ' w-56'} value={r.rischio} onChange={(e) => patch((d) => (d.rischi[i].rischio = e.target.value))} /></td>
                    <td><PercentField className={inputCls + ' w-16'} value={r.probabilita} onChange={(n) => patch((d) => (d.rischi[i].probabilita = n))} /></td>
                    <td><NumberField className={inputCls + ' w-24'} value={r.impattoEuro} onChange={(n) => patch((d) => (d.rischi[i].impattoEuro = n))} /></td>
                    <td><select className={inputCls} value={r.stato} onChange={(e) => patch((d) => (d.rischi[i].stato = e.target.value as typeof r.stato))}>{STATI_RIS.map((s) => <option key={s} value={s}>{t.statoRis[s]}</option>)}</select></td>
                    <td><button className="text-neutral-500 hover:text-red-400" onClick={() => patch((d) => d.rischi.splice(i, 1))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-sm gold-link" onClick={() => patch((d) => d.rischi.push({ id: 'R' + (d.rischi.length + 1), categoria: '', rischio: '', probabilita: 0.3, impattoEuro: 0, stato: 'Aperto' }))}>{t.btn.addRischio}</button>
        </Section>
      </div>

      {/* ---------------- DASHBOARD ---------------- */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <button onClick={calcola} disabled={pending} className="gold-btn mb-3 w-full py-3 text-base">
          {pending ? t.btn.calcolo : t.btn.valuta}
        </button>

        <div className="panel mb-4 flex flex-col gap-2 p-3">
          <input className="field-input" placeholder={t.ph.nome} value={nome} onChange={(e) => setNome(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={salva} disabled={saving} className="flex-1 rounded-lg border border-[var(--border-gold)] py-2 text-sm font-medium text-[var(--gold)] hover:bg-[rgba(201,162,75,0.08)] disabled:opacity-50">
              {saving ? t.btn.salvataggio : savedId ? t.btn.aggiorna : t.btn.salva}
            </button>
            {savedId && (
              <Link href={`/valutazioni/${savedId}/stampa`} target="_blank" className="flex-1 rounded-lg border border-[var(--border)] py-2 text-center text-sm font-medium text-[var(--text)] hover:border-[var(--gold)]">
                {t.btn.stampaPDF}
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <Link href="/valutazioni" className="gold-link">{t.btn.tutte}</Link>
            {savedMsg && <span className="text-[var(--muted)]">{savedMsg}</span>}
          </div>
        </div>

        {!res && <p className="text-sm text-[var(--muted)]">{t.ph.compila}</p>}

        {res && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center gap-3">
                <span className={`inline-block h-4 w-4 rounded-full ${semaforoColor}`} />
                <span className="text-lg font-bold">{t.map.esito[res.verdettoFinale.esito] ?? res.verdettoFinale.esito}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-400">{t.map.azione[res.verdettoFinale.esito] ?? res.verdettoFinale.azione}</p>
            </div>

            {res.ricavi.ricaviBase <= 0 ? (
              <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-300">{t.msg.inputIncompleto}</div>
            ) : (<>
            <Kpi label={t.dash.valoreRiskAdj} value={eur(res.residuale.valoreMaxRiskAdjusted)} highlight />
            {res.residuale.valoreMaxRiskAdjusted < 0 && (
              <div className="rounded-xl border border-red-800 bg-red-950/30 p-3 text-xs text-red-300">⚠ {t.msg.nonSostenibile}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Kpi label={t.dash.valorePreRisk} value={eur(res.residuale.valoreMaxPreRisk)} small />
              <Kpi label={t.dash.prezzoRich} value={eur(inp.terreno.prezzoRichiesto)} small />
              <Kpi label={t.dash.prezzoTratt} value={eur(res.residuale.prezzoTrattativa)} small />
              <Kpi label={t.dash.scontoNec} value={pct(res.residuale.scontoNecessario)} small />
            </div>

            <Card title={t.dash.mercato}>
              <Row k={t.dash.compValidi} v={`${res.mercato.comparabiliValidi}`} />
              <Row k={t.dash.mediaPond} v={eur2(res.mercato.mediaPonderata)} />
              <Row k={t.dash.prezzoPrud} v={eur2(res.mercato.prezzoPrudente)} />
              {res.mercato.alert !== 'OK' && <p className="mt-1 text-amber-400">{t.map.merAlert[res.mercato.alert] ?? res.mercato.alert}</p>}
            </Card>

            <Card title={t.dash.ricaviCosti}>
              <Row k={t.dash.mqVend} v={num(res.ricavi.mqVendibili)} />
              <Row k={t.dash.ricaviBase} v={eur(res.ricavi.ricaviBase)} />
              <Row k={t.dash.ricaviPrudenti} v={eur(res.ricavi.ricaviPrudenti)} />
              <Row k={t.dash.ricaviStress} v={eur(res.ricavi.ricaviStress)} />
              <div className="my-1 border-t border-[var(--border)]" />
              <Row k={t.dash.hardTotale} v={eur(res.costi.hardCostTotale)} />
              <Row k={t.dash.costoHardEquiv} v={eur2(res.costi.costoHardEquivMq)} />
              <Row k={t.dash.costiEsclTerreno} v={eur(res.costi.totaleEsclusoTerreno)} />
              <Row k={t.dash.prezzoTerreno} v={eur(res.costi.prezzoTerreno)} />
              <Row k={t.dash.costoTotIncl} v={eur(res.costi.totaleInclTerreno)} />
              <Row k={t.dash.costiRic} v={pct(res.costi.pctRicavi)} />
            </Card>

            <Card title={t.dash.cashflow}>
              <Row k={t.dash.van} v={eur(res.cashFlow.van)} />
              <Row k={t.dash.prezzoMaxDin} v={eur(res.cashFlow.prezzoMaxDinamico)} />
              <Row k={t.dash.tir} v={pct(res.cashFlow.tirAnnua)} />
              <Row k={t.dash.maxEsp} v={eur(res.cashFlow.massimaEsposizione)} />
            </Card>

            <Card title={t.dash.stress}>
              {res.stress.map((s) => (
                <Row key={s.nome} k={s.nome} v={`${eur(s.valoreMaxTerreno)} · ${s.verdetto}`} ok={s.verdetto === 'OK'} />
              ))}
            </Card>

            <Card title={t.dash.rischi}>
              <Row k={t.dash.statoRischio} v={t.map.risStato[res.rischi.stato] ?? res.rischi.stato} />
              <Row k={t.dash.perditaAttesa} v={eur(res.rischi.perditaAttesaPonderata)} />
              <Row k={t.dash.rischioLordo} v={eur(res.rischi.rischioLordoMassimo)} />
            </Card>

            <Card title={t.dash.audit}>
              <Row k={t.dash.ricaviPrudenti} v={eur(res.audit.ricaviUsati)} />
              <Row k={`− ${t.dash.costiEsclTerreno}`} v={eur(res.audit.costiEsclusoTerreno)} />
              <Row k={`− ${t.dash.margine}`} v={eur(res.audit.margine)} />
              <Row k={`− ${t.dash.premio}`} v={eur(res.audit.premio)} />
              <div className="my-1 border-t border-[var(--border)]" />
              <Row k={t.dash.valorePreRisk} v={eur(res.audit.preRisk)} />
              <Row k={`− ${t.dash.perditaAttesa}`} v={eur(res.audit.perditaAttesa)} />
              <Row k={t.dash.valoreRiskAdj} v={eur(res.audit.riskAdjusted)} />
              <p className="mt-2 text-xs text-[var(--muted)]">{t.dash.auditNota}</p>
            </Card>
            </>)}
          </div>
        )}
      </div>
    </div>
    </GuideCtx.Provider>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-sm">
      <h3 className="mb-2 font-semibold text-neutral-300">{title}</h3>
      {children}
    </div>
  )
}
function Kpi({ label, value, highlight, small }: { label: string; value: string; highlight?: boolean; small?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-[var(--border-gold)] bg-[rgba(201,162,75,0.07)]' : 'border-[var(--border)] bg-[var(--panel)]'}`}>
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className={`mt-1 font-bold ${small ? 'text-sm' : 'text-xl'}`}>{value}</div>
    </div>
  )
}
function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-neutral-400">{k}</span>
      <span className={ok === undefined ? '' : ok ? 'text-emerald-400' : 'text-red-400'}>{v}</span>
    </div>
  )
}
