// Test del motore. Esegui: node --test src/lib/valutazione/engine.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcMercato, pesoComparabile, valuta } from './engine.ts'
import type { Comparabile, InputValutazione } from './types.ts'

const approx = (a: number, b: number, tol = 0.01) => Math.abs(a - b) <= tol

// --- Golden: i 3 comparabili reali dell'Excel (parte corretta del modello) ---
const compGolden: Comparabile[] = [
  { id: 'C1', fonte: 'Notariado', distanzaKm: 1.2, superficieMq: 120, prezzo: 330000, includi: true, affidabilita: 0.9, qualita: 0.85 },
  { id: 'C2', fonte: 'Registradores', distanzaKm: 2.5, superficieMq: 135, prezzo: 360000, includi: true, affidabilita: 0.85, qualita: 0.8 },
  { id: 'C3', fonte: 'Tasazione', distanzaKm: 3, superficieMq: 95, prezzo: 255000, includi: true, affidabilita: 0.75, qualita: 0.7 },
]

test('peso comparabile = affidabilità×qualità/(1+km/10) [golden N4]', () => {
  assert.ok(approx(pesoComparabile(compGolden[0]), 0.6830357142857142, 1e-9))
  assert.ok(approx(pesoComparabile(compGolden[1]), 0.544, 1e-9))
  assert.ok(approx(pesoComparabile(compGolden[2]), 0.40384615384615374, 1e-9))
})

test('medie €/m² [golden B37/B38/B39]', () => {
  const m = calcMercato({ comparabili: compGolden, assunzioni: { haircut: 0.1 } } as unknown as InputValutazione)
  assert.equal(m.comparabiliValidi, 3)
  assert.ok(approx(m.mediaSemplice, 2700.2923976608186, 0.001), `mediaSemplice=${m.mediaSemplice}`)
  assert.ok(approx(m.mediaPonderata, 2705.9120984485367, 0.001), `mediaPonderata=${m.mediaPonderata}`)
})

test('prezzo prudente corretto (C3): ponderata×(1−haircut), niente valori negativi', () => {
  const m = calcMercato({ comparabili: compGolden, assunzioni: { haircut: 0.1 } } as unknown as InputValutazione)
  assert.ok(approx(m.prezzoPrudente, 2705.9120984485367 * 0.9, 0.001))
  assert.ok(m.prezzoPrudente > 0, 'il bug Excel dava negativo; ora deve essere positivo')
})

// --- Scenario realistico completo ---
function scenarioRealistico(): InputValutazione {
  const comp5: Comparabile[] = [
    ...compGolden,
    { id: 'C4', fonte: 'Notariado', distanzaKm: 1.8, superficieMq: 110, prezzo: 300000, includi: true, affidabilita: 0.85, qualita: 0.8 },
    { id: 'C5', fonte: 'Registradores', distanzaKm: 2.0, superficieMq: 125, prezzo: 335000, includi: true, affidabilita: 0.8, qualita: 0.75 },
  ]
  return {
    terreno: { comune: 'Torremolinos', superficieMq: 1000, prezzoRichiesto: 500000 },
    urbanistica: { classificazioneSuolo: 'Urbano', usoConsentito: 'Residenziale', edificabilita: 1.0, coeffVendibili: 0.88, numeroUnita: 8, tempoLicenzaMesi: 6 },
    assunzioni: {
      margineProm: 0.2, premioRischio: 0.05, haircut: 0.1, scontoCommerciale: 0.03, preVenditaPct: 0.3,
      tassoSconto: 0.1, tassoFinanziamento: 0.06, equityMin: 0.3, tirMin: 0.16, costoCostruzioneMqVendibile: 1350,
    },
    checklist: [
      { voce: 'Nota simple', critico: true, stato: 'Completo' },
      { voce: 'Informe urbanístico', critico: true, stato: 'Completo' },
    ],
    comparabili: comp5,
    costi: [
      { categoria: 'Hard costs', voce: 'Costruzione', base: 'eur_mq_vendibile', valore: 1350 },
      { categoria: 'Hard costs', voce: 'Urbanizzazione', base: 'manuale', valore: 200000 },
      { categoria: 'Soft costs', voce: 'Architetto', base: 'pct_hard', valore: 0.08 },
      { categoria: 'Soft costs', voce: 'OCT/sicurezza', base: 'manuale', valore: 45000 },
      { categoria: 'Tasse', voce: 'Licenze/ICIO', base: 'pct_ricavi', valore: 0.04 },
      { categoria: 'Commerciale', voce: 'Marketing', base: 'pct_ricavi', valore: 0.035 },
      { categoria: 'Finanza', voce: 'Interessi', base: 'pct_ricavi', valore: 0.035 },
      { categoria: 'Contingency', voce: 'Imprevisti', base: 'pct_hard_soft', valore: 0.08 },
    ],
    rischi: [
      { id: 'R1', categoria: 'Urbanistica', rischio: 'Edificabilità minore', probabilita: 0.3, impattoEuro: 100000, stato: 'Aperto' },
    ],
    distribuzioneCosti: [0.05, 0.08, 0.1, 0.12, 0.14, 0.14, 0.12, 0.1, 0.07, 0.04, 0.03, 0.01],
    distribuzioneIncassi: [0, 0, 0, 0.05, 0.1, 0.12, 0.15, 0.15, 0.14, 0.12, 0.1, 0.07],
    durataTrimestri: 12,
    scenari: [
      { nome: 'Base', varPrezzo: 0, varCostoCostruzione: 0, varCostiAltri: 0, mesiExtra: 0, tassoSconto: 0.1 },
      { nome: 'Prudente', varPrezzo: -0.07, varCostoCostruzione: 0.07, varCostiAltri: 0.05, mesiExtra: 6, tassoSconto: 0.12 },
      { nome: 'Stress', varPrezzo: -0.12, varCostoCostruzione: 0.12, varCostiAltri: 0.1, mesiExtra: 12, tassoSconto: 0.14 },
    ],
  }
}

test('scenario realistico: ricavi e residuale sensati (niente numeri rotti)', () => {
  const r = valuta(scenarioRealistico())
  // m² vendibili = 1000 × 1.0 × 0.88 = 880
  assert.equal(r.ricavi.mqVendibili, 880)
  // prezzo netto ≈ prudente(~2435) × (1−0.03); ricavi lordi nell'ordine dei milioni
  assert.ok(r.ricavi.ricaviPrudenti > 1_500_000, `ricaviPrudenti=${r.ricavi.ricaviPrudenti}`)
  assert.ok(r.ricavi.ricaviBase > r.ricavi.ricaviPrudenti && r.ricavi.ricaviPrudenti > r.ricavi.ricaviStress, 'base > prudenti > stress')
  assert.ok(r.costi.totaleEsclusoTerreno > 0)
  assert.ok(Number.isFinite(r.residuale.valoreMaxTerreno))
  assert.ok(Number.isFinite(r.cashFlow.van))
  assert.ok(['VERDE', 'GIALLO', 'ROSSO'].includes(r.verdettoFinale.semaforo))
  console.log('  → verdetto:', r.verdettoFinale.esito, '| valoreMaxTerreno:', Math.round(r.residuale.valoreMaxTerreno), '€ | VAN:', Math.round(r.cashFlow.van), '€ | TIR:', (r.cashFlow.tirAnnua * 100).toFixed(1) + '%')
})

test('gate quarantena se manca documento critico', () => {
  const inp = scenarioRealistico()
  inp.checklist[0].stato = 'Mancante'
  const r = valuta(inp)
  assert.equal(r.verdettoFinale.esito, 'QUARANTENA DOCUMENTALE')
})

test('gate <5 comparabili → NON VALUTABILE MERCATO', () => {
  const inp = scenarioRealistico()
  inp.comparabili = inp.comparabili.slice(0, 3)
  const r = valuta(inp)
  assert.equal(r.verdettoFinale.esito, 'NON VALUTABILE MERCATO')
})
