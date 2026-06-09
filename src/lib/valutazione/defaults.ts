import type { InputValutazione } from './types'
import type { Lang } from '@/lib/i18n'

// Etichette di default localizzate. I valori "canonici" (categoria, base, stato)
// restano invariati: li usa il motore.
const L = {
  it: {
    classif: 'Urbano', uso: 'Residenziale', tasazione: 'Tasazione',
    doc: ['Nota simple aggiornata', 'Informe urbanístico / PGOU', 'Referencia catastral', 'Preventivo costruzione (QS)'],
    costi: ['Costo costruzione fuori terra', 'Urbanizzazione/allacci', 'Architetto/ingegneria/DL', 'OCT, geotecnica, sicurezza', 'Licenze, ICIO, tasas', 'Marketing, agenzia, vendite', 'Interessi e spese finanziarie', 'Imprevisti tecnici', 'Demolizioni/bonifiche', 'Imposte acquisto (ITP o IVA+AJD)', 'Sótano / garajes / trasteros'],
    rischi: ['Edificabilità inferiore al previsto', 'Cargas, servitù o diritti terzi', 'Costo costruzione superiore'],
    scenari: ['Base', 'Prudente', 'Stress'],
  },
  es: {
    classif: 'Urbano', uso: 'Residencial', tasazione: 'Tasación',
    doc: ['Nota simple actualizada', 'Informe urbanístico / PGOU', 'Referencia catastral', 'Presupuesto construcción (QS)'],
    costi: ['Coste construcción sobre rasante', 'Urbanización/acometidas', 'Arquitecto/ingeniería/DO', 'OCT, geotecnia, seguridad', 'Licencias, ICIO, tasas', 'Marketing, agencia, ventas', 'Intereses y gastos financieros', 'Imprevistos técnicos', 'Demolición/saneamiento', 'Impuestos de compra (ITP o IVA+AJD)', 'Sótano / garajes / trasteros'],
    rischi: ['Edificabilidad inferior a lo previsto', 'Cargas, servidumbres o derechos de terceros', 'Coste de construcción superior'],
    scenari: ['Base', 'Prudente', 'Estrés'],
  },
} as const

export function getInputDefault(lang: Lang): InputValutazione {
  const t = L[lang]
  return {
    terreno: {
      comune: 'Jerez de la Frontera - Calle Flores 4 / Plaza Basurto 2 y 4',
      indirizzo: 'Calle Flores 4 / Plaza Basurto 2 y 4',
      refCatastral: 'Da verificare con certificacion catastral descriptiva y grafica',
      fincaRegistral: '',
      superficieMq: 691.97,
      superficieCatastoMq: 668.43,
      prezzoRichiesto: 800000,
      statoTerreno: 'libero',
    },
    urbanistica: { classificazioneSuolo: 'urbano', usoConsentito: 'residenziale', edificabilita: 1.8004, coeffVendibili: 0.796, mqSotterraneo: 650, numeroUnita: 17, tempoLicenzaMesi: 6 },
    assunzioni: {
      margineProm: 0.2, premioRischio: 0.05, haircut: 0.1, scontoCommerciale: 0.03, preVenditaPct: 0.3,
      tassoSconto: 0.1, tassoFinanziamento: 0.06, equityMin: 0.3, tirMin: 0.16, costoCostruzioneMqVendibile: 2200,
      riskMode: 'expected_loss',
    },
    checklist: [
      { key: 'nota', voce: t.doc[0], critico: true, stato: 'Mancante' },
      { key: 'informe', voce: t.doc[1], critico: true, stato: 'Mancante' },
      { key: 'catastral', voce: t.doc[2], critico: true, stato: 'Da verificare' },
      { key: 'presupuesto', voce: t.doc[3], critico: true, stato: 'Mancante' },
      { voce: 'Licencia de obra 2008 - storica, verificare vigencia/caducidad, proroghe, LISTA/PGOU e Ayuntamiento', critico: true, stato: 'Da verificare' },
    ],
    comparabili: [
      { id: 'C1', fonte: 'Notariado', distanzaKm: 1.2, superficieMq: 120, prezzo: 330000, includi: true, affidabilita: 0.9, qualita: 0.85 },
      { id: 'C2', fonte: 'Registradores', distanzaKm: 2.5, superficieMq: 135, prezzo: 360000, includi: true, affidabilita: 0.85, qualita: 0.8 },
      { id: 'C3', fonte: t.tasazione, distanzaKm: 3, superficieMq: 95, prezzo: 255000, includi: true, affidabilita: 0.75, qualita: 0.7 },
      { id: 'C4', fonte: 'Notariado', distanzaKm: 1.8, superficieMq: 110, prezzo: 300000, includi: true, affidabilita: 0.85, qualita: 0.8 },
      { id: 'C5', fonte: 'Registradores', distanzaKm: 2.0, superficieMq: 125, prezzo: 335000, includi: true, affidabilita: 0.8, qualita: 0.75 },
    ],
    costi: [
      { categoria: 'Hard costs', voce: t.costi[0], base: 'eur_mq_techo', valore: 1350 },
      { categoria: 'Hard costs', voce: t.costi[10], base: 'eur_mq_sotterraneo', valore: 850 },
      { categoria: 'Hard costs', voce: t.costi[1], base: 'manuale', valore: 75000 },
      { categoria: 'Soft costs', voce: t.costi[2], base: 'pct_hard', valore: 0.08 },
      { categoria: 'Soft costs', voce: t.costi[3], base: 'manuale', valore: 35000 },
      { categoria: 'Tasse/licenze', voce: t.costi[4], base: 'pct_hard', valore: 0.04 },
      { categoria: 'Commerciale', voce: t.costi[5], base: 'pct_ricavi', valore: 0.035 },
      { categoria: 'Finanza', voce: t.costi[6], base: 'pct_ricavi', valore: 0.035 },
      { categoria: 'Contingency', voce: t.costi[7], base: 'pct_hard', valore: 0.1 },
    ],
    rischi: [
      { id: 'R1', categoria: 'Urbanistica', rischio: 'Edificabilita/licenza non pienamente recuperabile', probabilita: 0.45, impattoEuro: 250000, stato: 'Aperto' },
      { id: 'R2', categoria: 'Legale', rischio: 'Cargas, servidumbres, embargos, afecciones fiscales', probabilita: 0.25, impattoEuro: 150000, stato: 'Aperto' },
      { id: 'R3', categoria: 'Tecnico', rischio: 'Coste costruzione superiore al budget', probabilita: 0.6, impattoEuro: 250000, stato: 'Aperto' },
      { id: 'R4', categoria: 'Catasto/Registro', rischio: 'Disallineamento Catasto / Registro / progetto', probabilita: 0.35, impattoEuro: 100000, stato: 'Aperto' },
      { id: 'R5', categoria: 'Licenza', rischio: 'Licenza scaduta, non prorogabile o necessita di nuova tramitazione', probabilita: 0.4, impattoEuro: 200000, stato: 'Aperto' },
      { id: 'R6', categoria: 'Centro storico', rischio: 'Rischio centro storico / archeologia / patrimonio', probabilita: 0.3, impattoEuro: 150000, stato: 'Aperto' },
    ],
    distribuzioneCosti: [0.05, 0.08, 0.1, 0.12, 0.14, 0.14, 0.12, 0.1, 0.07, 0.04, 0.03, 0.01],
    distribuzioneIncassi: [0, 0, 0, 0.05, 0.1, 0.12, 0.15, 0.15, 0.14, 0.12, 0.1, 0.07],
    durataTrimestri: 12,
    scenari: [
      { nome: t.scenari[0], varPrezzo: 0, varCostoCostruzione: 0, varCostiAltri: 0, mesiExtra: 0, tassoSconto: 0.1 },
      { nome: t.scenari[1], varPrezzo: -0.07, varCostoCostruzione: 0.07, varCostiAltri: 0.05, mesiExtra: 6, tassoSconto: 0.12 },
      { nome: t.scenari[2], varPrezzo: -0.1, varCostoCostruzione: 0.12, varCostiAltri: 0.1, mesiExtra: 12, tassoSconto: 0.14 },
    ],
  }
}

export const inputDefault: InputValutazione = getInputDefault('it')
