import { cookies } from 'next/headers'

export type Lang = 'it' | 'es'
export const LANG_COOKIE = 'lang'
export const LANGS: Lang[] = ['it', 'es']

const it = {
  langName: 'Italiano',
  nav: { app: 'Valutazione Terreno', valutazioni: 'Valutazioni', nuova: 'Nuova', esci: 'Esci' },
  footer: 'Proenesys Europe · strumento interno di due diligence — uso riservato',
  auth: {
    accedi: 'Accedi', registrati: 'Registrati', email: 'Email', password: 'Password',
    login: 'Login', crea: 'Crea account', minPwd: 'Password (min 6)',
    haiAccount: 'Hai già un account?', nonHaiAccount: 'Non hai un account?',
  },
  page: {
    eyebrow: 'Due Diligence', titolo: 'Valutazione del Terreno',
    sottotitolo: "Valore residuale, cash flow e verdetto d'investimento. Il calcolo gira sul server: le formule restano protette.",
    eyebrowMod: 'Modifica · Due Diligence',
    sottotitoloMod: 'Modifica i parametri, ricalcola e aggiorna il salvataggio. Poi stampa in PDF.',
  },
  sec: {
    terreno: 'Terreno', urbanistica: 'Urbanistica', assunzioni: 'Assunzioni investimento',
    documenti: 'Documenti (gate quarantena)', comparabili: 'Comparabili di mercato (min. 5 validi)',
    costi: 'Costi di sviluppo', rischi: 'Risk register',
  },
  f: {
    comune: 'Comune / zona', refCat: 'Referencia catastral', superficie: 'Superficie urbanistica (m²)', superficieCatasto: 'Superficie catasto/registro (m²)',
    prezzo: 'Prezzo richiesto (€)', classificazione: 'Classificazione suolo', uso: 'Uso consentito',
    edificabilita: 'Edificabilità (m²techo/m²suelo)', coeff: 'Coeff. m² vendibili / m² techo',
    mqSotterraneo: 'm² sotto rasante (sótano)',
    numeroUnita: 'Numero unità', tempoLicenza: 'Tempo licenza (mesi)',
    margineProm: 'Margine promotore', premioRischio: 'Premio rischio', haircut: 'Haircut prezzo mercato',
    scontoCommerciale: 'Sconto commerciale', preVenditaPct: 'Pre-vendite attese', tassoSconto: 'Tasso sconto annuo',
    tassoFinanziamento: 'Tasso finanziamento', tirMin: 'Soglia minima TIR',
    costoCostr: 'Costo costruzione (€/m² vendibile)', statoTerreno: 'Stato del terreno',
  },
  statoTerr: { libero: 'Libero / non edificato', edificato: 'Edificio esistente da demolire', bonifica: 'Preesistenze / da bonificare' },
  classifOpt: { urbano: 'Urbano', urbanizzabile: 'Urbanizzabile', rustico: 'Rustico / agricolo', da_verificare: 'Da verificare' },
  usoOpt: { residenziale: 'Residenziale', terziario: 'Terziario / uffici', commerciale: 'Commerciale', misto: 'Misto' },
  th: {
    fonte: 'Fonte', km: 'km', mq: 'm²', prezzoE: 'Prezzo €', affid: 'Affid.', qual: 'Qual.', incl: 'Incl.',
    voce: 'Voce', base: 'Base', valore: 'Valore', rischio: 'Rischio', prob: 'Prob.', impatto: 'Impatto €', stato: 'Stato',
  },
  basi: { manuale: 'Importo €', eur_mq_techo: '€/m² costruito (fuori terra)', eur_mq_sotterraneo: '€/m² costruito (sotto rasante)', eur_mq_vendibile: '€/m² vendibile (derivato)', pct_hard: '% Hard costs', pct_hard_soft: '% Hard+Soft', pct_ricavi: '% Ricavi', pct_terreno: '% Prezzo terreno' },
  docNames: { nota: 'Nota simple aggiornata', informe: 'Informe urbanístico / PGOU', catastral: 'Referencia catastral', presupuesto: 'Preventivo costruzione (QS)' },
  statoDoc: { Completo: 'Completo', Mancante: 'Mancante', 'Da verificare': 'Da verificare', 'Non applicabile': 'Non applicabile' },
  statoRis: { Aperto: 'Aperto', 'Da verificare': 'Da verificare', Chiuso: 'Chiuso', Bloccante: 'Bloccante' },
  docNota: '* documento critico: se «Mancante» il terreno va in quarantena documentale.',
  guideLabels: { cosa: 'Cosa', perche: 'Perché', dove: 'Dove' },
  btn: {
    valuta: 'Valuta terreno', calcolo: 'Calcolo…', salva: 'Salva valutazione', aggiorna: 'Aggiorna salvataggio',
    salvataggio: 'Salvataggio…', stampaPDF: 'Stampa PDF', tutte: '← Tutte le valutazioni',
    nuova: '+ Nuova valutazione', addComp: '+ aggiungi comparabile', addCosto: '+ aggiungi costo', addRischio: '+ aggiungi rischio',
    elimina: 'Elimina', apri: 'Apri', pdf: 'PDF', stampaSalva: 'Stampa / Salva come PDF',
  },
  ph: { nome: 'Nome valutazione (es. Torremolinos – Lotto 41B)', compila: 'Compila i dati e premi «Valuta terreno». Il calcolo gira sul server.' },
  msg: {
    salvata: 'Valutazione salvata ✓', erroreSalva: 'Errore nel salvataggio: ',
    inputIncompleto: 'Input urbanistico incompleto: imposta edificabilità (> 0) e assicurati di avere ≥ 5 comparabili validi. Senza ricavi il valore del terreno non è calcolabile.',
    warnDemol: 'Hai indicato un edificio/preesistenze ma il costo «Demolizioni/bonifiche» è 0: inseriscilo nei costi.',
    warnSuperfici: 'Discordanza tra superficie urbanistica e catasto/registro: usa quella urbanistica come base di calcolo e verifica la differenza con Catasto/Registro.',
    warnEdificabilita: 'Edificabilità insolitamente alta: verifica il formato (indice tipico 0,5–3 m²/m²). I decimali si scrivono con la virgola (es. 1,8004).',
    nonSostenibile: 'Operazione non sostenibile con questi input: il valore del terreno è negativo. Verifica il costo costruzione (€/m² vendibile), che i costi NON includano il terreno e che i ricavi non siano già lo scenario stress.',
  },
  dash: {
    valoreMax: 'Valore max terreno (residuale)', prezzoRich: 'Prezzo richiesto', prezzoTratt: 'Prezzo trattativa',
    scontoNec: 'Sconto necessario', verdStatico: 'Verdetto statico', mercato: 'Mercato',
    compValidi: 'Comparabili validi', mediaPond: 'Media ponderata €/m²', prezzoPrud: 'Prezzo prudente €/m²', prezzoBanc: 'Prezzo bancabile €/m²',
    ricaviCosti: 'Ricavi & costi', mqVend: 'm² vendibili', ricaviLordi: 'Ricavi lordi', costiSvil: 'Costi sviluppo', costiRic: 'Costi su ricavi',
    cashflow: 'Cash flow dinamico', van: 'VAN al prezzo richiesto', prezzoMaxDin: 'Prezzo max dinamico', tir: 'TIR annua', maxEsp: 'Massima esposizione',
    stress: 'Stress test', rischi: 'Rischi', statoRischio: 'Stato rischio', scoreAperto: 'Score aperto', docMancanti: 'Documenti critici mancanti',
    ricaviBase: 'Ricavi base (prezzo mercato)', ricaviPrudenti: 'Ricavi prudenti (−haircut)', ricaviStress: 'Ricavi stress (−sconto)',
    costiEsclTerreno: 'Costi sviluppo (escluso terreno)', prezzoTerreno: 'Prezzo terreno richiesto', costoTotIncl: 'Costo totale (incl. terreno)',
    perditaAttesa: 'Perdita attesa ponderata', rischioLordo: 'Rischio lordo massimo',
    valorePreRisk: 'Valore terreno pre-risk', valoreRiskAdj: 'Valore terreno risk-adjusted',
    audit: 'Audit formula', auditNota: 'Valore = Ricavi − Costi(escl. terreno) − Margine − Premio − Perdita attesa', margine: 'Margine promotore', premio: 'Premio rischio',
    hardTotale: 'Hard cost costruzione totale', costoHardEquiv: 'Costo hard equivalente €/m² vendibile (derivato)',
  },
  arch: { archivio: 'Archivio', titolo: 'Le mie valutazioni', nessuna: 'Nessuna valutazione salvata. Creane una con «Nuova valutazione».', valoreMax: 'Valore max terreno', richiesto: 'richiesto' },
  memo: { titolo: 'Investment Memo · Valutazione Terreno', terrenoPrezzo: 'Terreno & prezzo', superficie: 'Superficie', rifNd: 'rif. catastale n/d', generato: 'generato il', riservato: 'Proenesys Europe · documento interno di due diligence — uso riservato' },
  map: {
    esito: {
      'QUARANTENA DOCUMENTALE': 'QUARANTENA DOCUMENTALE', 'NON VALUTABILE MERCATO': 'NON VALUTABILE (MERCATO)',
      'BLOCCO URBANISTICO': 'BLOCCO URBANISTICO', 'RISCHIO BLOCCANTE': 'RISCHIO BLOCCANTE',
      'INVESTIBILE CON DISCIPLINA': 'INVESTIBILE CON DISCIPLINA', 'TRATTARE CON SCONTO': 'TRATTARE CON SCONTO',
      SCARTARE: 'SCARTARE', 'COMPLETARE DUE DILIGENCE': 'COMPLETARE DUE DILIGENCE',
    } as Record<string, string>,
    azione: {
      'QUARANTENA DOCUMENTALE': 'Completare la due diligence documentale', 'NON VALUTABILE MERCATO': 'Raccogliere almeno 5 comparabili reali',
      'BLOCCO URBANISTICO': 'Verificare urbanistica prima di procedere', 'RISCHIO BLOCCANTE': 'Risolvere i rischi bloccanti',
      'INVESTIBILE CON DISCIPLINA': 'Preparare offerta condizionata', 'TRATTARE CON SCONTO': 'Rinegoziare prezzo e sospensive',
      SCARTARE: 'Lasciare salvo prezzo killer', 'COMPLETARE DUE DILIGENCE': 'Completare due diligence',
    } as Record<string, string>,
    resVerd: {
      SCARTARE: 'SCARTARE', 'INVESTIBILE STATICO': 'INVESTIBILE STATICO',
      'TRATTARE SOLO CON CONDIZIONI': 'TRATTARE SOLO CON CONDIZIONI', 'PREZZO TROPPO ALTO': 'PREZZO TROPPO ALTO',
    } as Record<string, string>,
    merAlert: {
      'MENO DI 5 COMPARABILI: NON DECIDERE': 'MENO DI 5 COMPARABILI: NON DECIDERE',
      'PREZZO MERCATO NON CALCOLATO': 'PREZZO MERCATO NON CALCOLATO', OK: 'OK',
    } as Record<string, string>,
    risStato: {
      BLOCCANTE: 'BLOCCANTE', 'RISCHIO ALTO': 'RISCHIO ALTO', 'TROPPI RISCHI APERTI': 'TROPPI RISCHI APERTI', OK: 'OK',
    } as Record<string, string>,
  },
}

export type Dict = typeof it

const es: Dict = {
  langName: 'Español',
  nav: { app: 'Valoración de Suelo', valutazioni: 'Valoraciones', nuova: 'Nueva', esci: 'Salir' },
  footer: 'Proenesys Europe · herramienta interna de due diligence — uso reservado',
  auth: {
    accedi: 'Acceder', registrati: 'Registrarse', email: 'Email', password: 'Contraseña',
    login: 'Entrar', crea: 'Crear cuenta', minPwd: 'Contraseña (mín. 6)',
    haiAccount: '¿Ya tienes cuenta?', nonHaiAccount: '¿No tienes cuenta?',
  },
  page: {
    eyebrow: 'Due Diligence', titolo: 'Valoración del Suelo',
    sottotitolo: 'Valor residual, flujo de caja y veredicto de inversión. El cálculo se ejecuta en el servidor: las fórmulas quedan protegidas.',
    eyebrowMod: 'Editar · Due Diligence',
    sottotitoloMod: 'Modifica los parámetros, recalcula y actualiza el guardado. Luego imprime en PDF.',
  },
  sec: {
    terreno: 'Suelo', urbanistica: 'Urbanismo', assunzioni: 'Hipótesis de inversión',
    documenti: 'Documentos (control cuarentena)', comparabili: 'Comparables de mercado (mín. 5 válidos)',
    costi: 'Costes de desarrollo', rischi: 'Registro de riesgos',
  },
  f: {
    comune: 'Municipio / zona', refCat: 'Referencia catastral', superficie: 'Superficie urbanística (m²)', superficieCatasto: 'Superficie catastro/registro (m²)',
    prezzo: 'Precio solicitado (€)', classificazione: 'Clasificación del suelo', uso: 'Uso permitido',
    edificabilita: 'Edificabilidad (m²techo/m²suelo)', coeff: 'Coef. m² vendibles / m² techo',
    mqSotterraneo: 'm² bajo rasante (sótano)',
    numeroUnita: 'Número de unidades', tempoLicenza: 'Tiempo de licencia (meses)',
    margineProm: 'Margen del promotor', premioRischio: 'Prima de riesgo', haircut: 'Haircut precio mercado',
    scontoCommerciale: 'Descuento comercial', preVenditaPct: 'Preventas esperadas', tassoSconto: 'Tasa de descuento anual',
    tassoFinanziamento: 'Tasa de financiación', tirMin: 'TIR mínima exigida',
    costoCostr: 'Coste de construcción (€/m² vendible)', statoTerreno: 'Estado del suelo',
  },
  statoTerr: { libero: 'Libre / sin edificar', edificato: 'Edificio existente a demoler', bonifica: 'Preexistencias / a sanear' },
  classifOpt: { urbano: 'Urbano', urbanizzabile: 'Urbanizable', rustico: 'Rústico / agrícola', da_verificare: 'Por verificar' },
  usoOpt: { residenziale: 'Residencial', terziario: 'Terciario / oficinas', commerciale: 'Comercial', misto: 'Mixto' },
  th: {
    fonte: 'Fuente', km: 'km', mq: 'm²', prezzoE: 'Precio €', affid: 'Fiab.', qual: 'Cal.', incl: 'Incl.',
    voce: 'Partida', base: 'Base', valore: 'Valor', rischio: 'Riesgo', prob: 'Prob.', impatto: 'Impacto €', stato: 'Estado',
  },
  basi: { manuale: 'Importe €', eur_mq_techo: '€/m² construido (sobre rasante)', eur_mq_sotterraneo: '€/m² construido (bajo rasante)', eur_mq_vendibile: '€/m² vendible (derivado)', pct_hard: '% Hard costs', pct_hard_soft: '% Hard+Soft', pct_ricavi: '% Ingresos', pct_terreno: '% Precio suelo' },
  docNames: { nota: 'Nota simple actualizada', informe: 'Informe urbanístico / PGOU', catastral: 'Referencia catastral', presupuesto: 'Presupuesto construcción (QS)' },
  statoDoc: { Completo: 'Completo', Mancante: 'Falta', 'Da verificare': 'Por verificar', 'Non applicabile': 'No aplicable' },
  statoRis: { Aperto: 'Abierto', 'Da verificare': 'Por verificar', Chiuso: 'Cerrado', Bloccante: 'Bloqueante' },
  docNota: '* documento crítico: si «Falta», el suelo entra en cuarentena documental.',
  guideLabels: { cosa: 'Qué', perche: 'Por qué', dove: 'Dónde' },
  btn: {
    valuta: 'Valorar suelo', calcolo: 'Calculando…', salva: 'Guardar valoración', aggiorna: 'Actualizar guardado',
    salvataggio: 'Guardando…', stampaPDF: 'Imprimir PDF', tutte: '← Todas las valoraciones',
    nuova: '+ Nueva valoración', addComp: '+ añadir comparable', addCosto: '+ añadir coste', addRischio: '+ añadir riesgo',
    elimina: 'Eliminar', apri: 'Abrir', pdf: 'PDF', stampaSalva: 'Imprimir / Guardar como PDF',
  },
  ph: { nome: 'Nombre de la valoración (ej. Torremolinos – Lote 41B)', compila: 'Rellena los datos y pulsa «Valorar suelo». El cálculo se ejecuta en el servidor.' },
  msg: {
    salvata: 'Valoración guardada ✓', erroreSalva: 'Error al guardar: ',
    inputIncompleto: 'Input urbanístico incompleto: define la edificabilidad (> 0) y asegúrate de tener ≥ 5 comparables válidos. Sin ingresos no se puede calcular el valor del suelo.',
    warnDemol: 'Has indicado un edificio/preexistencias pero el coste de «Demolición/saneamiento» es 0: introdúcelo en los costes.',
    warnSuperfici: 'Discrepancia entre superficie urbanística y catastro/registro: usa la urbanística como base de cálculo y verifica la diferencia con Catastro/Registro.',
    warnEdificabilita: 'Edificabilidad inusualmente alta: verifica el formato (índice típico 0,5–3 m²/m²). Los decimales se escriben con coma (ej. 1,8004).',
    nonSostenibile: 'Operación no sostenible con estos inputs: el valor del suelo es negativo. Verifica el coste de construcción (€/m² vendible), que los costes NO incluyan el suelo y que los ingresos no sean ya el escenario estrés.',
  },
  dash: {
    valoreMax: 'Valor máx. del suelo (residual)', prezzoRich: 'Precio solicitado', prezzoTratt: 'Precio de negociación',
    scontoNec: 'Descuento necesario', verdStatico: 'Veredicto estático', mercato: 'Mercado',
    compValidi: 'Comparables válidos', mediaPond: 'Media ponderada €/m²', prezzoPrud: 'Precio prudente €/m²', prezzoBanc: 'Precio bancable €/m²',
    ricaviCosti: 'Ingresos y costes', mqVend: 'm² vendibles', ricaviLordi: 'Ingresos brutos', costiSvil: 'Costes de desarrollo', costiRic: 'Costes sobre ingresos',
    cashflow: 'Flujo de caja dinámico', van: 'VAN al precio solicitado', prezzoMaxDin: 'Precio máx. dinámico', tir: 'TIR anual', maxEsp: 'Exposición máxima',
    stress: 'Test de estrés', rischi: 'Riesgos', statoRischio: 'Estado del riesgo', scoreAperto: 'Score abierto', docMancanti: 'Documentos críticos faltantes',
    ricaviBase: 'Ingresos base (precio mercado)', ricaviPrudenti: 'Ingresos prudentes (−haircut)', ricaviStress: 'Ingresos estrés (−descuento)',
    costiEsclTerreno: 'Costes de desarrollo (sin suelo)', prezzoTerreno: 'Precio del suelo solicitado', costoTotIncl: 'Coste total (con suelo)',
    perditaAttesa: 'Pérdida esperada ponderada', rischioLordo: 'Riesgo bruto máximo',
    valorePreRisk: 'Valor del suelo pre-riesgo', valoreRiskAdj: 'Valor del suelo risk-adjusted',
    audit: 'Auditoría fórmula', auditNota: 'Valor = Ingresos − Costes(sin suelo) − Margen − Prima − Pérdida esperada', margine: 'Margen del promotor', premio: 'Prima de riesgo',
    hardTotale: 'Hard cost construcción total', costoHardEquiv: 'Coste hard equivalente €/m² vendible (derivado)',
  },
  arch: { archivio: 'Archivo', titolo: 'Mis valoraciones', nessuna: 'No hay valoraciones guardadas. Crea una con «Nueva valoración».', valoreMax: 'Valor máx. del suelo', richiesto: 'solicitado' },
  memo: { titolo: 'Investment Memo · Valoración de Suelo', terrenoPrezzo: 'Suelo y precio', superficie: 'Superficie', rifNd: 'ref. catastral n/d', generato: 'generado el', riservato: 'Proenesys Europe · documento interno de due diligence — uso reservado' },
  map: {
    esito: {
      'QUARANTENA DOCUMENTALE': 'CUARENTENA DOCUMENTAL', 'NON VALUTABILE MERCATO': 'NO VALORABLE (MERCADO)',
      'BLOCCO URBANISTICO': 'BLOQUEO URBANÍSTICO', 'RISCHIO BLOCCANTE': 'RIESGO BLOQUEANTE',
      'INVESTIBILE CON DISCIPLINA': 'INVERTIBLE CON DISCIPLINA', 'TRATTARE CON SCONTO': 'NEGOCIAR CON DESCUENTO',
      SCARTARE: 'DESCARTAR', 'COMPLETARE DUE DILIGENCE': 'COMPLETAR DUE DILIGENCE',
    },
    azione: {
      'QUARANTENA DOCUMENTALE': 'Completar la due diligence documental', 'NON VALUTABILE MERCATO': 'Reunir al menos 5 comparables reales',
      'BLOCCO URBANISTICO': 'Verificar urbanismo antes de continuar', 'RISCHIO BLOCCANTE': 'Resolver los riesgos bloqueantes',
      'INVESTIBILE CON DISCIPLINA': 'Preparar oferta condicionada', 'TRATTARE CON SCONTO': 'Renegociar precio y condiciones suspensivas',
      SCARTARE: 'Dejar salvo precio “killer”', 'COMPLETARE DUE DILIGENCE': 'Completar due diligence',
    },
    resVerd: {
      SCARTARE: 'DESCARTAR', 'INVESTIBILE STATICO': 'INVERTIBLE (ESTÁTICO)',
      'TRATTARE SOLO CON CONDIZIONI': 'NEGOCIAR SOLO CON CONDICIONES', 'PREZZO TROPPO ALTO': 'PRECIO DEMASIADO ALTO',
    },
    merAlert: {
      'MENO DI 5 COMPARABILI: NON DECIDERE': 'MENOS DE 5 COMPARABLES: NO DECIDIR',
      'PREZZO MERCATO NON CALCOLATO': 'PRECIO DE MERCADO NO CALCULADO', OK: 'OK',
    },
    risStato: {
      BLOCCANTE: 'BLOQUEANTE', 'RISCHIO ALTO': 'RIESGO ALTO', 'TROPPI RISCHI APERTI': 'DEMASIADOS RIESGOS ABIERTOS', OK: 'OK',
    },
  },
}

export const DICT: Record<Lang, Dict> = { it, es }
export const getDict = (lang: Lang): Dict => DICT[lang]

export async function getLang(): Promise<Lang> {
  const c = await cookies()
  const v = c.get(LANG_COOKIE)?.value
  return v === 'es' ? 'es' : 'it'
}
