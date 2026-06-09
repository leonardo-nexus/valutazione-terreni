// Mini-guida per ogni campo: cosa inserire, perché serve, dove trovarlo.
// Bilingue IT/ES. Fonte: foglio "Guida_Compilazione" dell'Excel + note delle celle.
import type { Lang } from '@/lib/i18n'

export type Guida = { cosa: string; perche: string; dove: string }
export type GuidaKey =
  | 'comune' | 'refCatastral' | 'superficieMq' | 'superficieCatastoMq' | 'prezzoRichiesto' | 'statoTerreno'
  | 'classificazioneSuolo' | 'usoConsentito' | 'edificabilita' | 'coeffVendibili' | 'mqSotterraneo' | 'numeroUnita' | 'tempoLicenzaMesi'
  | 'margineProm' | 'premioRischio' | 'haircut' | 'scontoCommerciale' | 'preVenditaPct' | 'tassoSconto' | 'tassoFinanziamento' | 'tirMin' | 'costoCostruzioneMqVendibile'
  | 'comparabili' | 'costi' | 'rischi' | 'documenti'

const GUIDE_IT: Record<GuidaKey, Guida> = {
  comune: { cosa: 'Comune e microzona del terreno (es. Torremolinos – zona Playamar).', perche: 'Identifica il mercato locale su cui calibrare prezzi e comparabili.', dove: 'Ubicazione del lotto / annuncio / nota simple.' },
  refCatastral: { cosa: 'Codice catastale esatto del lotto (referencia catastral).', perche: 'Identifica univocamente la particella e ne certifica la superficie.', dove: 'Sede Electrónica del Catastro (catastro.meh.es).' },
  superficieMq: { cosa: 'Superficie usata come base urbanistica/edificatoria (m²).', perche: 'È la base dei calcoli di edificabilità e ricavi. Usa quella dell’informe urbanístico.', dove: 'Informe urbanístico / giustificazione edificatoria.' },
  superficieCatastoMq: { cosa: 'Superficie del solar secondo Catasto/Registro (può differire da quella urbanistica).', perche: 'Se diverge dalla superficie urbanistica, segnala un disallineamento documentale da chiarire.', dove: 'Certificación catastral / nota simple del Registro.' },
  prezzoRichiesto: { cosa: 'Prezzo richiesto dal venditore in €.', perche: 'È il prezzo da confrontare col valore residuale — non è il valore del terreno.', dove: 'Offerta del venditore / agenzia.' },
  statoTerreno: { cosa: 'Stato attuale: libero, con un edificio da demolire, o con preesistenze da bonificare.', perche: 'Se non è libero servono costi di demolizione/bonifica: inseriscili nella voce «Demolizioni/bonifiche» dei costi.', dove: 'Sopralluogo, foto, Catastro (costruito esistente), tecnico.' },
  classificazioneSuolo: { cosa: 'Classificazione del suolo (urbano, urbanizzabile, rustico…).', perche: 'Determina se e cosa si può costruire. Se «da verificare» il modello blocca.', dove: 'Informe urbanístico / PGOU del Comune (Ayuntamiento).' },
  usoConsentito: { cosa: 'Uso urbanistico ammesso (residenziale, terziario…).', perche: 'Definisce la destinazione e quindi i ricavi possibili.', dove: 'Informe urbanístico / PGOU.' },
  edificabilita: { cosa: 'Edificabilità: m² costruibili (techo) per ogni m² di suolo.', perche: 'Moltiplica la superficie per ottenere i m² costruibili teorici. Non inventarla.', dove: 'Informe urbanístico / PGOU (documento ufficiale).' },
  coeffVendibili: { cosa: 'Quota di m² vendibili sui m² techo (net saleable area), es. 0,85–0,90.', perche: 'I m² techo includono muri e spazi comuni: solo una parte è vendibile.', dove: 'Progetto/architetto, o standard prudente di mercato.' },
  mqSotterraneo: { cosa: 'm² costruiti sotto rasante (sótano, garage, trasteros).', perche: 'Hanno un costo €/m² diverso dal fuori terra e vanno calcolati a parte.', dove: 'Progetto / plano de sótano.' },
  numeroUnita: { cosa: 'Numero di unità (case/appartamenti) previste in vendita.', perche: 'Serve per ricavi, assorbimento di mercato e tempi di vendita.', dove: 'Studio di fattibilità / progetto preliminare.' },
  tempoLicenzaMesi: { cosa: 'Mesi stimati per ottenere la licenza edilizia.', perche: 'Ritarda l’avvio: incide su cash flow e costi finanziari. Sii prudente.', dove: 'Esperienza locale / tecnico / Ayuntamiento.' },
  margineProm: { cosa: 'Margine promotore target sui ricavi (es. 0,20 = 20%).', perche: 'È il profitto che vuoi garantirti: riduce il valore massimo del terreno.', dove: 'Strategia d’investimento. Minimo suggerito 18–25%.' },
  premioRischio: { cosa: 'Premio per il rischio sui ricavi (es. 0,05 = 5%).', perche: 'Cuscinetto extra: aumentalo se documenti o rischi sono deboli.', dove: 'Valutazione del rischio del progetto.' },
  haircut: { cosa: 'Riduzione prudenziale sul prezzo di mercato (es. 0,10 = 10%).', perche: 'Abbatte la media ponderata dei comparabili per non sovrastimare.', dove: 'Politica prudenziale interna.' },
  scontoCommerciale: { cosa: 'Sconto medio applicato in vendita (es. 0,03 = 3%).', perche: 'I prezzi di listino raramente coincidono col venduto reale.', dove: 'Dati storici di vendita / agenzia.' },
  preVenditaPct: { cosa: 'Quota di unità pre-vendute attese (es. 0,30 = 30%).', perche: 'Le pre-vendite anticipano incassi e riducono l’esposizione.', dove: 'Assunzione commerciale prudente.' },
  tassoSconto: { cosa: 'Tasso di sconto annuo per il cash flow (es. 0,10 = 10%).', perche: 'È il costo-opportunità del capitale: attualizza i flussi futuri.', dove: 'Strategia finanziaria / rendimento atteso.' },
  tassoFinanziamento: { cosa: 'Tasso annuo del debito bancario (es. 0,06 = 6%).', perche: 'Calcola gli interessi sull’esposizione negativa nel cash flow.', dove: 'Preventivo/condizioni della banca.' },
  tirMin: { cosa: 'TIR annua minima accettabile (es. 0,16 = 16%).', perche: 'Soglia di rendimento sotto la quale l’operazione non conviene.', dove: 'Obiettivo di rendimento dell’investitore.' },
  costoCostruzioneMqVendibile: { cosa: 'Costo di costruzione in €/m² vendibile.', perche: 'È la voce di costo più pesante: determina la fattibilità.', dove: 'Preventivo impresa / Quantity Surveyor / tecnico locale.' },
  comparabili: { cosa: 'Vendite reali simili: fonte, distanza (km), m², prezzo, affidabilità e qualità (0–1).', perche: 'Da qui si calcola il prezzo di mercato ponderato. Servono ≥5 comparabili validi.', dove: 'Notariado, Registradores, atti, tasazioni. NON gli annunci immobiliari.' },
  costi: { cosa: 'Voci di costo con la loro base (importo, €/m², % hard, % ricavi…).', perche: 'Sommati danno il costo di sviluppo, sottratto ai ricavi nel residuale.', dove: 'Preventivi impresa/tecnici, Comune (oneri), banca (finanza).' },
  rischi: { cosa: 'Rischi con probabilità (0–1), impatto € e stato.', perche: 'Lo score (probabilità × impatto) può declassare o bloccare il verdetto.', dove: 'Avvocato, architetto, tecnico, banca.' },
  documenti: { cosa: 'Stato dei documenti chiave (completo / mancante / da verificare).', perche: 'Se manca un documento critico, il terreno va in quarantena: niente firma cieca.', dove: 'Catastro, Registro, Ayuntamiento, venditore.' },
}

const GUIDE_ES: Record<GuidaKey, Guida> = {
  comune: { cosa: 'Municipio y microzona del suelo (ej. Torremolinos – zona Playamar).', perche: 'Identifica el mercado local para calibrar precios y comparables.', dove: 'Ubicación del lote / anuncio / nota simple.' },
  refCatastral: { cosa: 'Código catastral exacto del lote (referencia catastral).', perche: 'Identifica de forma única la parcela y certifica su superficie.', dove: 'Sede Electrónica del Catastro (catastro.meh.es).' },
  superficieMq: { cosa: 'Superficie usada como base urbanística/edificatoria (m²).', perche: 'Es la base de los cálculos de edificabilidad e ingresos. Usa la del informe urbanístico.', dove: 'Informe urbanístico / justificación edificatoria.' },
  superficieCatastoMq: { cosa: 'Superficie del solar según Catastro/Registro (puede diferir de la urbanística).', perche: 'Si difiere de la superficie urbanística, indica un desajuste documental a aclarar.', dove: 'Certificación catastral / nota simple del Registro.' },
  prezzoRichiesto: { cosa: 'Precio solicitado por el vendedor en €.', perche: 'Es el precio a comparar con el valor residual — no es el valor del suelo.', dove: 'Oferta del vendedor / agencia.' },
  statoTerreno: { cosa: 'Estado actual: libre, con un edificio a demoler, o con preexistencias a sanear.', perche: 'Si no está libre hacen falta costes de demolición/saneamiento: introdúcelos en la partida «Demolición/saneamiento».', dove: 'Visita, fotos, Catastro (construido existente), técnico.' },
  classificazioneSuolo: { cosa: 'Clasificación del suelo (urbano, urbanizable, rústico…).', perche: 'Determina si y qué se puede construir. Si «por verificar» el modelo bloquea.', dove: 'Informe urbanístico / PGOU del Ayuntamiento.' },
  usoConsentito: { cosa: 'Uso urbanístico permitido (residencial, terciario…).', perche: 'Define el destino y por tanto los ingresos posibles.', dove: 'Informe urbanístico / PGOU.' },
  edificabilita: { cosa: 'Edificabilidad: m² construibles (techo) por cada m² de suelo.', perche: 'Multiplica la superficie para obtener los m² construibles teóricos. No la inventes.', dove: 'Informe urbanístico / PGOU (documento oficial).' },
  coeffVendibili: { cosa: 'Proporción de m² vendibles sobre m² techo (net saleable area), ej. 0,85–0,90.', perche: 'Los m² techo incluyen muros y zonas comunes: solo una parte es vendible.', dove: 'Proyecto/arquitecto, o estándar prudente de mercado.' },
  mqSotterraneo: { cosa: 'm² construidos bajo rasante (sótano, garaje, trasteros).', perche: 'Tienen un coste €/m² distinto del sobre rasante y se calculan aparte.', dove: 'Proyecto / plano de sótano.' },
  numeroUnita: { cosa: 'Número de unidades (viviendas/pisos) previstas en venta.', perche: 'Necesario para ingresos, absorción de mercado y plazos de venta.', dove: 'Estudio de viabilidad / proyecto preliminar.' },
  tempoLicenzaMesi: { cosa: 'Meses estimados para obtener la licencia de obra.', perche: 'Retrasa el inicio: afecta al flujo de caja y a los costes financieros. Sé prudente.', dove: 'Experiencia local / técnico / Ayuntamiento.' },
  margineProm: { cosa: 'Margen del promotor objetivo sobre ingresos (ej. 0,20 = 20%).', perche: 'Es el beneficio que quieres asegurar: reduce el valor máximo del suelo.', dove: 'Estrategia de inversión. Mínimo sugerido 18–25%.' },
  premioRischio: { cosa: 'Prima de riesgo sobre ingresos (ej. 0,05 = 5%).', perche: 'Colchón extra: auméntalo si documentos o riesgos son débiles.', dove: 'Evaluación del riesgo del proyecto.' },
  haircut: { cosa: 'Reducción prudencial sobre el precio de mercado (ej. 0,10 = 10%).', perche: 'Rebaja la media ponderada de los comparables para no sobrestimar.', dove: 'Política prudencial interna.' },
  scontoCommerciale: { cosa: 'Descuento medio aplicado en venta (ej. 0,03 = 3%).', perche: 'Los precios de catálogo rara vez coinciden con lo realmente vendido.', dove: 'Datos históricos de venta / agencia.' },
  preVenditaPct: { cosa: 'Proporción de unidades pre-vendidas esperadas (ej. 0,30 = 30%).', perche: 'Las preventas adelantan cobros y reducen la exposición.', dove: 'Hipótesis comercial prudente.' },
  tassoSconto: { cosa: 'Tasa de descuento anual para el flujo de caja (ej. 0,10 = 10%).', perche: 'Es el coste de oportunidad del capital: actualiza los flujos futuros.', dove: 'Estrategia financiera / rentabilidad esperada.' },
  tassoFinanziamento: { cosa: 'Tasa anual de la deuda bancaria (ej. 0,06 = 6%).', perche: 'Calcula los intereses sobre la exposición negativa en el flujo de caja.', dove: 'Presupuesto/condiciones del banco.' },
  tirMin: { cosa: 'TIR anual mínima aceptable (ej. 0,16 = 16%).', perche: 'Umbral de rentabilidad bajo el cual la operación no conviene.', dove: 'Objetivo de rentabilidad del inversor.' },
  costoCostruzioneMqVendibile: { cosa: 'Coste de construcción en €/m² vendible.', perche: 'Es la partida de coste más pesada: determina la viabilidad.', dove: 'Presupuesto de constructora / Quantity Surveyor / técnico local.' },
  comparabili: { cosa: 'Ventas reales similares: fuente, distancia (km), m², precio, fiabilidad y calidad (0–1).', perche: 'De aquí se calcula el precio de mercado ponderado. Hacen falta ≥5 comparables válidos.', dove: 'Notariado, Registradores, escrituras, tasaciones. NO los anuncios inmobiliarios.' },
  costi: { cosa: 'Partidas de coste con su base (importe, €/m², % hard, % ingresos…).', perche: 'Sumadas dan el coste de desarrollo, restado a los ingresos en el residual.', dove: 'Presupuestos de constructora/técnicos, Ayuntamiento (cargas), banco (financiación).' },
  rischi: { cosa: 'Riesgos con probabilidad (0–1), impacto € y estado.', perche: 'El score (probabilidad × impacto) puede degradar o bloquear el veredicto.', dove: 'Abogado, arquitecto, técnico, banco.' },
  documenti: { cosa: 'Estado de los documentos clave (completo / falta / por verificar).', perche: 'Si falta un documento crítico, el suelo entra en cuarentena: nada de firmar a ciegas.', dove: 'Catastro, Registro, Ayuntamiento, vendedor.' },
}

export const GUIDE: Record<Lang, Record<GuidaKey, Guida>> = { it: GUIDE_IT, es: GUIDE_ES }
