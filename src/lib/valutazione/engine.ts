// Motore di valutazione terreno (versione CORRETTA — vedi CORREZIONI.md).
// Funzioni pure, nessuna dipendenza: riusabile lato server in qualsiasi app.

import type {
  InputValutazione,
  RisultatoValutazione,
  Comparabile,
  VoceCosto,
  ScenarioStress,
} from './types'

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d

// ---------- Mercato (comparabili) ----------
export function pesoComparabile(c: Comparabile): number {
  return (c.affidabilita * c.qualita) / (1 + c.distanzaKm / 10)
}
function comparabileValido(c: Comparabile): boolean {
  return c.includi && c.superficieMq > 0 && c.prezzo > 0 && pesoComparabile(c) > 0
}

export function calcMercato(input: InputValutazione) {
  const validi = input.comparabili.filter(comparabileValido)
  const n = validi.length
  const prezziMq = validi.map((c) => c.prezzo / c.superficieMq)
  const pesi = validi.map(pesoComparabile)
  const mediaSemplice = n ? prezziMq.reduce((a, b) => a + b, 0) / n : 0
  const sommaPesi = pesi.reduce((a, b) => a + b, 0)
  const mediaPonderata = sommaPesi
    ? prezziMq.reduce((acc, p, i) => acc + p * pesi[i], 0) / sommaPesi
    : 0
  const h = input.assunzioni.haircut
  // C3/C4: prezzo prudente e bancabile dalla media PONDERATA, haircut come percentuale
  const prezzoPrudente = mediaPonderata > 0 ? mediaPonderata * (1 - h) : 0
  const prezzoBancabile = mediaPonderata > 0 ? mediaPonderata * (1 - h * 1.5) : 0
  const alert = n < 5 ? 'MENO DI 5 COMPARABILI: NON DECIDERE' : mediaPonderata === 0 ? 'PREZZO MERCATO NON CALCOLATO' : 'OK'
  return { comparabiliValidi: n, mediaSemplice, mediaPonderata, prezzoPrudente, prezzoBancabile, alert }
}

// ---------- Documentale ----------
function calcDocumentale(input: InputValutazione) {
  const mancantiCritici = input.checklist
    .filter((d) => d.critico && d.stato === 'Mancante')
    .map((d) => d.voce)
  const daVerificare = input.checklist.some((d) => d.stato === 'Da verificare')
  const alert = mancantiCritici.length
    ? 'QUARANTENA DOCUMENTALE'
    : daVerificare
      ? 'VALUTABILE CON RISERVA'
      : 'DOCUMENTI COMPLETI'
  return { alert, mancantiCritici }
}

// ---------- Urbanistica ----------
function calcUrbanistica(input: InputValutazione): 'OK' | 'CON RISERVA' | 'BLOCCANTE' {
  const u = input.urbanistica
  const classif = u.classificazioneSuolo.trim().toLowerCase()
  const bloccante =
    classif === 'da_verificare' ||
    classif === 'da verificare' ||
    u.edificabilita <= 0 ||
    u.numeroUnita <= 0
  if (bloccante) return 'BLOCCANTE'
  return 'OK'
}

// ---------- Ricavi: 3 scenari distinti (base / prudente / stress) ----------
function calcRicavi(input: InputValutazione, prezzoMedioMercato: number, prezzoPrudenteMq: number) {
  const { superficieMq } = input.terreno
  const { edificabilita, coeffVendibili } = input.urbanistica
  const mqTecho = superficieMq * edificabilita // C1
  const mqVendibili = mqTecho * coeffVendibili // C2
  const prezzoNettoMq = prezzoPrudenteMq * (1 - input.assunzioni.scontoCommerciale)
  const ricaviBase = mqVendibili * prezzoMedioMercato // prezzo medio mercato (NON scontato)
  const ricaviPrudenti = mqVendibili * prezzoPrudenteMq // dopo haircut
  const ricaviStress = mqVendibili * prezzoNettoMq // dopo haircut + sconto commerciale
  const preVendite = ricaviPrudenti * input.assunzioni.preVenditaPct
  return { mqVendibili, mqTecho, prezzoMedioMercato, prezzoPrudenteMq, prezzoNettoMq, ricaviBase, ricaviPrudenti, ricaviStress, preVendite }
}

// ---------- Costi: il costo tecnico è su m² costruiti; €/m² vendibile è solo derivato ----------
function calcCosti(
  costi: VoceCosto[],
  mqVendibili: number,
  mqTecho: number,
  mqSotterraneo: number,
  ricaviLordi: number,
  prezzoTerreno: number,
) {
  // primo passaggio: hard e voci con base assoluta
  const totali = costi.map((v) => {
    switch (v.base) {
      case 'manuale':
        return v.valore
      case 'eur_mq_vendibile':
        return v.valore * mqVendibili
      case 'eur_mq_techo':
        return v.valore * mqTecho // costo costruzione fuori terra (m² costruiti)
      case 'eur_mq_sotterraneo':
        return v.valore * mqSotterraneo // sótano/garajes (m² sotto rasante)
      case 'pct_ricavi':
        return v.valore * ricaviLordi
      case 'pct_terreno':
        return v.valore * prezzoTerreno
      default:
        return 0 // calcolato nel secondo passaggio
    }
  })
  const hard = costi.reduce((s, v, i) => (v.categoria === 'Hard costs' ? s + totali[i] : s), 0)
  // secondo passaggio: percentuali su hard / hard+soft
  costi.forEach((v, i) => {
    if (v.base === 'pct_hard') totali[i] = v.valore * hard
  })
  const soft = costi.reduce((s, v, i) => (v.categoria === 'Soft costs' ? s + totali[i] : s), 0)
  costi.forEach((v, i) => {
    if (v.base === 'pct_hard_soft') totali[i] = v.valore * (hard + soft)
  })
  const totale = totali.reduce((a, b) => a + b, 0)
  // "Hard cost costruzione" = SOLO costruzione (fuori terra + sotto rasante), come da definizione.
  const costruzione = costi.reduce(
    (s, v, i) => (v.base === 'eur_mq_techo' || v.base === 'eur_mq_sotterraneo' ? s + totali[i] : s),
    0,
  )
  return {
    totale,
    hardCostTotale: costruzione,
    costoHardEquivMq: mqVendibili ? costruzione / mqVendibili : 0, // €/m² vendibile = output derivato, NON input
    perMqVendibile: mqVendibili ? totale / mqVendibili : 0,
    pctRicavi: ricaviLordi ? totale / ricaviLordi : 0,
    dettaglio: costi.map((v, i) => ({ voce: v.voce, totale: totali[i] })),
  }
}

// ---------- Residuale: pre-risk e risk-adjusted (terreno SEMPRE escluso dai costi) ----------
function calcResiduale(input: InputValutazione, ricaviNetti: number, costiEsclusoTerreno: number, perditaAttesa: number) {
  const { margineProm, premioRischio, riskMode } = input.assunzioni
  const prezzo = input.terreno.prezzoRichiesto
  // Base = ricavi NETTI (post haircut + sconto commerciale). Il prezzo terreno NON entra qui.
  const margine = margineProm * ricaviNetti
  // Scala leggibile: break-even (margine 0) ≥ pre-risk (con margine) ≥ risk-adjusted.
  const valoreBreakEven = ricaviNetti - costiEsclusoTerreno
  const valoreMaxPreRisk = valoreBreakEven - margine
  // T3: UNA sola fonte di rischio (mai premio% + perdita attesa insieme).
  const mode = riskMode ?? 'expected_loss'
  const rischioApplicato =
    mode === 'risk_premium' ? premioRischio * ricaviNetti : mode === 'expected_loss' ? perditaAttesa : 0
  const valoreMaxRiskAdjusted = valoreMaxPreRisk - rischioApplicato
  const valoreMax = valoreMaxRiskAdjusted
  const delta = valoreMax - prezzo
  const scontoNecessario = prezzo ? Math.max(-delta / prezzo, 0) : 0
  const prezzoTrattativa = Math.max(valoreMax * 0.85, 0)
  const prezzoMax = Math.max(valoreMax * 1.1, 0)
  let verdetto: string
  if (valoreMax <= 0) verdetto = 'SCARTARE'
  else if (prezzo <= valoreMax) verdetto = 'INVESTIBILE STATICO'
  else if (prezzo <= prezzoMax) verdetto = 'TRATTARE SOLO CON CONDIZIONI'
  else verdetto = 'PREZZO TROPPO ALTO'
  return { valoreBreakEven, rischioApplicato, valoreMaxPreRisk, valoreMaxRiskAdjusted, valoreMaxTerreno: valoreMax, delta, scontoNecessario, prezzoTrattativa, prezzoMax, verdetto }
}

// ---------- Cash flow dinamico (trimestrale) ----------
function irr(flows: number[]): number {
  // Newton su tasso trimestrale; fallback bisezione.
  const npv = (r: number) => flows.reduce((s, cf, t) => s + cf / (1 + r) ** t, 0)
  let lo = -0.9999
  let hi = 1
  if (npv(lo) * npv(hi) > 0) return 0
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const v = npv(mid)
    if (Math.abs(v) < 1e-6) return mid
    if (npv(lo) * v < 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

function calcCashFlow(
  input: InputValutazione,
  prezzoTerreno: number,
  costiSviluppo: number,
  ricaviLordi: number,
) {
  const T = input.durataTrimestri
  const rAnnuo = input.assunzioni.tassoSconto
  const rFin = input.assunzioni.tassoFinanziamento
  const dc = input.distribuzioneCosti
  const di = input.distribuzioneIncassi
  const netto: number[] = []
  const cumulato: number[] = []
  let cum = 0
  for (let t = 0; t < T; t++) {
    const terreno = t === 0 ? -prezzoTerreno : 0
    const costo = -costiSviluppo * (dc[t] ?? 0)
    const incasso = ricaviLordi * (di[t] ?? 0)
    const interessi = Math.min(0, cum) * (rFin / 4) // interessi su esposizione negativa
    const cf = terreno + costo + incasso + interessi
    netto.push(cf)
    cum += cf
    cumulato.push(cum)
  }
  const scontati = netto.map((cf, t) => cf / (1 + rAnnuo) ** ((t + 1) / 4))
  const van = scontati.reduce((a, b) => a + b, 0)
  const prezzoMaxDinamico = prezzoTerreno + van
  const tirTrim = irr(netto)
  const tirAnnua = tirTrim > -1 ? (1 + tirTrim) ** 4 - 1 : 0
  const massimaEsposizione = Math.min(...cumulato)
  return { van, prezzoMaxDinamico, tirAnnua, massimaEsposizione }
}

// ---------- Stress ----------
function calcStress(input: InputValutazione, ricaviBase: number, costiBase: number): RisultatoValutazione['stress'] {
  const { margineProm } = input.assunzioni
  const prezzo = input.terreno.prezzoRichiesto
  return input.scenari.map((s: ScenarioStress) => {
    const ricavi = ricaviBase * (1 + s.varPrezzo)
    const costi = costiBase * (1 + s.varCostoCostruzione + s.varCostiAltri)
    const valoreMax = ricavi - costi - margineProm * ricavi
    const gap = valoreMax - prezzo
    return { nome: s.nome, valoreMaxTerreno: valoreMax, gap, verdetto: (valoreMax >= prezzo ? 'OK' : 'NO') as 'OK' | 'NO' }
  })
}

// ---------- Rischi: perdita attesa ponderata + rischio lordo massimo ----------
function calcRischi(input: InputValutazione) {
  const aperti = input.rischi.filter((r) => r.stato !== 'Chiuso')
  const perditaAttesaPonderata = aperti.reduce((s, r) => s + r.probabilita * r.impattoEuro, 0)
  const rischioLordoMassimo = aperti.reduce((s, r) => s + r.impattoEuro, 0)
  const bloccantiAperti = input.rischi.filter((r) => r.stato === 'Bloccante').length
  const apertiTotali = input.rischi.filter((r) => r.stato === 'Aperto' || r.stato === 'Da verificare').length
  return { perditaAttesaPonderata, rischioLordoMassimo, bloccantiAperti, apertiTotali }
}
function statoRischio(m: ReturnType<typeof calcRischi>, valoreRif: number): string {
  if (m.bloccantiAperti > 0) return 'BLOCCANTE'
  if (m.perditaAttesaPonderata > Math.max(valoreRif, 0) * 0.15) return 'RISCHIO ALTO'
  if (m.apertiTotali > 5) return 'TROPPI RISCHI APERTI'
  return 'OK'
}

// ---------- Orchestrazione + verdetto finale ----------
export function valuta(input: InputValutazione): RisultatoValutazione {
  const documentale = calcDocumentale(input)
  const urbanistica = { stato: calcUrbanistica(input) }
  const mercato = calcMercato(input)
  const ricavi = calcRicavi(input, mercato.mediaPonderata, mercato.prezzoPrudente)
  const prezzoTerreno = input.terreno.prezzoRichiesto
  const mqSotterraneo = input.urbanistica.mqSotterraneo ?? 0
  // I costi escludono SEMPRE il prezzo del terreno (le % ricavi usano lo scenario realistico/stress).
  const costiCalc = calcCosti(input.costi, ricavi.mqVendibili, ricavi.mqTecho, mqSotterraneo, ricavi.ricaviStress, prezzoTerreno)
  const rischiM = calcRischi(input)
  // T3: il valore terreno usa i ricavi NETTI (post haircut + sconto commerciale).
  const residuale = calcResiduale(input, ricavi.ricaviStress, costiCalc.totale, rischiM.perditaAttesaPonderata)
  const cashFlow = calcCashFlow(input, prezzoTerreno, costiCalc.totale, ricavi.ricaviStress)
  const stress = calcStress(input, ricavi.ricaviStress, costiCalc.totale)
  const rischi = {
    perditaAttesaPonderata: rischiM.perditaAttesaPonderata,
    rischioLordoMassimo: rischiM.rischioLordoMassimo,
    scoreApertoTotale: rischiM.perditaAttesaPonderata, // alias retro-compatibile
    bloccantiAperti: rischiM.bloccantiAperti,
    apertiTotali: rischiM.apertiTotali,
    stato: statoRischio(rischiM, residuale.valoreMaxPreRisk),
  }

  const costi = {
    totale: costiCalc.totale,
    totaleEsclusoTerreno: costiCalc.totale,
    hardCostTotale: costiCalc.hardCostTotale,
    costoHardEquivMq: costiCalc.costoHardEquivMq,
    mqTecho: ricavi.mqTecho,
    mqSotterraneo,
    perMqVendibile: costiCalc.perMqVendibile,
    pctRicavi: costiCalc.pctRicavi,
    prezzoTerreno,
    totaleInclTerreno: costiCalc.totale + prezzoTerreno,
    dettaglio: costiCalc.dettaglio,
  }

  const A = input.assunzioni
  const mode = A.riskMode ?? 'expected_loss'
  const audit = {
    ricaviUsati: ricavi.ricaviStress,
    costiEsclusoTerreno: costiCalc.totale,
    margine: A.margineProm * ricavi.ricaviStress,
    premio: mode === 'risk_premium' ? A.premioRischio * ricavi.ricaviStress : 0,
    perditaAttesa: mode === 'expected_loss' ? rischiM.perditaAttesaPonderata : 0,
    preRisk: residuale.valoreMaxPreRisk,
    riskAdjusted: residuale.valoreMaxRiskAdjusted,
  }

  // Gate a cascata (come Dashboard_Decisionale!G4)
  const scenarioPrudente = stress.find((s) => /pruden/i.test(s.nome))
  const scenarioBase = stress.find((s) => /base/i.test(s.nome))
  let esito: RisultatoValutazione['verdettoFinale']['esito']
  if (documentale.mancantiCritici.length) esito = 'QUARANTENA DOCUMENTALE'
  else if (mercato.comparabiliValidi < 5) esito = 'NON VALUTABILE MERCATO'
  else if (urbanistica.stato === 'BLOCCANTE') esito = 'BLOCCO URBANISTICO'
  else if (rischi.bloccantiAperti > 0) esito = 'RISCHIO BLOCCANTE'
  else if (scenarioPrudente?.verdetto === 'OK') esito = 'INVESTIBILE CON DISCIPLINA'
  else if (scenarioBase?.verdetto === 'OK') esito = 'TRATTARE CON SCONTO'
  else esito = 'SCARTARE'

  const semaforo =
    esito === 'INVESTIBILE CON DISCIPLINA' ? 'VERDE' : esito === 'TRATTARE CON SCONTO' ? 'GIALLO' : 'ROSSO'
  const azione =
    esito === 'INVESTIBILE CON DISCIPLINA'
      ? 'Preparare offerta condizionata'
      : esito === 'TRATTARE CON SCONTO'
        ? 'Rinegoziare prezzo e sospensive'
        : esito === 'SCARTARE'
          ? 'Lasciare salvo prezzo killer'
          : 'Completare due diligence'

  return {
    documentale,
    urbanistica,
    mercato: {
      ...mercato,
      mediaSemplice: round(mercato.mediaSemplice),
      mediaPonderata: round(mercato.mediaPonderata),
      prezzoPrudente: round(mercato.prezzoPrudente),
      prezzoBancabile: round(mercato.prezzoBancabile),
    },
    ricavi,
    costi,
    residuale,
    cashFlow,
    stress,
    rischi,
    audit,
    verdettoFinale: { esito, semaforo, azione },
  }
}
