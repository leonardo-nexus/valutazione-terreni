// Tipi del dominio "Valutazione Terreno". Vedi CORREZIONI.md per gli scostamenti
// rispetto all'Excel originale. Tutto in EUR e m² salvo diversa indicazione.

export type StatoDocumento = 'Completo' | 'Mancante' | 'Da verificare' | 'Non applicabile'

export interface VoceChecklist {
  voce: string
  critico: boolean
  stato: StatoDocumento
  key?: 'nota' | 'informe' | 'catastral' | 'presupuesto'
}

export interface Comparabile {
  id: string
  fonte: string
  dataVendita?: string
  distanzaKm: number
  superficieMq: number
  prezzo: number
  includi: boolean
  affidabilita: number // 0..1
  qualita: number // 0..1
}

export interface VoceRischio {
  id: string
  categoria: string
  rischio: string
  probabilita: number // 0..1
  impattoEuro: number
  impattoMesi?: number
  stato: 'Aperto' | 'Da verificare' | 'Chiuso' | 'Bloccante'
}

export interface ScenarioStress {
  nome: string
  varPrezzo: number // es. -0.07
  varCostoCostruzione: number
  varCostiAltri: number
  mesiExtra: number
  tassoSconto: number
}

export interface VoceCosto {
  categoria: string
  voce: string
  // come si calcola la voce:
  base:
    | 'manuale'
    | 'pct_hard'
    | 'pct_ricavi'
    | 'pct_hard_soft'
    | 'eur_mq_vendibile'
    | 'eur_mq_techo'
    | 'eur_mq_sotterraneo'
    | 'pct_terreno'
  valore: number // importo manuale, oppure percentuale (0..1), oppure €/m²
}

export interface InputValutazione {
  terreno: {
    comune: string
    indirizzo?: string
    refCatastral?: string
    fincaRegistral?: string
    superficieMq: number
    superficieCatastoMq?: number
    prezzoRichiesto: number
    statoTerreno?: 'libero' | 'edificato' | 'bonifica'
  }
  urbanistica: {
    classificazioneSuolo: string
    usoConsentito: string
    edificabilita: number // m² techo / m² suelo
    coeffVendibili: number // m² vendibili / m² techo
    mqSotterraneo?: number // m² costruiti sotto rasante (sótano/garajes)
    numeroUnita: number
    tempoLicenzaMesi: number
  }
  assunzioni: {
    margineProm: number // % su ricavi (0..1)
    premioRischio: number // % su ricavi
    haircut: number // riduzione prudenziale prezzo mercato
    scontoCommerciale: number // sconto in vendita (0..1)
    preVenditaPct: number // quota pre-venduto (0..1)
    tassoSconto: number // annuo
    tassoFinanziamento: number // annuo
    equityMin: number
    tirMin: number // soglia minima TIR annua
    costoCostruzioneMqVendibile: number // €/m²
  }
  checklist: VoceChecklist[]
  comparabili: Comparabile[]
  costi: VoceCosto[]
  rischi: VoceRischio[]
  // curve trimestrali (devono sommare a 1). Lunghezza = durataTrimestri.
  distribuzioneCosti: number[]
  distribuzioneIncassi: number[]
  durataTrimestri: number
  scenari: ScenarioStress[]
}

export type Verdetto =
  | 'QUARANTENA DOCUMENTALE'
  | 'NON VALUTABILE MERCATO'
  | 'BLOCCO URBANISTICO'
  | 'RISCHIO BLOCCANTE'
  | 'INVESTIBILE CON DISCIPLINA'
  | 'TRATTARE CON SCONTO'
  | 'SCARTARE'
  | 'COMPLETARE DUE DILIGENCE'

export interface RisultatoValutazione {
  documentale: { alert: string; mancantiCritici: string[] }
  urbanistica: { stato: 'OK' | 'CON RISERVA' | 'BLOCCANTE' }
  mercato: {
    comparabiliValidi: number
    mediaSemplice: number
    mediaPonderata: number
    prezzoPrudente: number
    prezzoBancabile: number
    alert: string
  }
  ricavi: {
    mqVendibili: number
    prezzoMedioMercato: number
    prezzoPrudenteMq: number
    prezzoNettoMq: number
    ricaviBase: number
    ricaviPrudenti: number
    ricaviStress: number
    preVendite: number
  }
  costi: {
    totale: number
    totaleEsclusoTerreno: number
    hardCostTotale: number
    costoHardEquivMq: number
    mqTecho: number
    mqSotterraneo: number
    perMqVendibile: number
    pctRicavi: number
    prezzoTerreno: number
    totaleInclTerreno: number
    dettaglio: { voce: string; totale: number }[]
  }
  residuale: {
    valoreMaxPreRisk: number
    valoreMaxRiskAdjusted: number
    valoreMaxTerreno: number
    delta: number
    scontoNecessario: number
    prezzoTrattativa: number
    prezzoMax: number
    verdetto: string
  }
  cashFlow: { van: number; prezzoMaxDinamico: number; tirAnnua: number; massimaEsposizione: number }
  stress: { nome: string; valoreMaxTerreno: number; gap: number; verdetto: 'OK' | 'NO' }[]
  rischi: {
    perditaAttesaPonderata: number
    rischioLordoMassimo: number
    scoreApertoTotale: number
    bloccantiAperti: number
    apertiTotali: number
    stato: string
  }
  audit: {
    ricaviUsati: number
    costiEsclusoTerreno: number
    margine: number
    premio: number
    perditaAttesa: number
    preRisk: number
    riskAdjusted: number
  }
  verdettoFinale: { esito: Verdetto; semaforo: 'VERDE' | 'GIALLO' | 'ROSSO'; azione: string }
}
