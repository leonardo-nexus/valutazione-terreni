# Correzioni rispetto all'Excel originale

> Il motore dell'app **non** replica 1:1 l'Excel `Valutazione_Terreno_PRO_v3_HYBRID_DD.xlsx`,
> perché quel file contiene errori di formula e dati segnaposto che producono risultati
> privi di senso (es. prezzo prudente di −7.304.053 €/m², ricavi lordi di 0,78 €).
> Qui sotto ogni correzione applicata. **Da approvare prima del rilascio.**

## Bug strutturali corretti

| # | Foglio!Cella | Formula Excel (errata) | Problema | Correzione applicata |
|---|---|---|---|---|
| C1 | `Input_Terreno!B17` (m² techo) | `=B8*B16` | Moltiplica superficie × coeff. vendibili invece che × edificabilità | `m²techo = superficie × edificabilità` |
| C2 | `Input_Terreno!B18` (m² vendibili) | `=B18*B17` | **Riferimento circolare** (cella a sé stessa) → sempre 0 | `m²vendibili = m²techo × coeff.vendibili` |
| C3 | `Dati_Mercato_Reali!B41` (prezzo prudente) | `=B38*(1-B39)` | `B39` è la media **ponderata in €/m²** (~2705), non una %. Sottrae un prezzo come fosse uno sconto → valore negativo enorme | `prezzoPrudente = mediaPonderata × (1 − haircut)` |
| C4 | `Dati_Mercato_Reali!B42` (prezzo bancabile) | `=B38*(1-Input!B25*1.5)` | Usa la media semplice; coerenza con C3 | `prezzoBancabile = mediaPonderata × (1 − haircut×1.5)` |
| C5 | `Ricavi_Attesi!B4,C4` | `B4=Input!B20`, `C4=Input!B19/B20` | Collega "tempo licenza" come "numero unità"; "m² per unità" = unità/mesi (incoerente) | Ricavi derivati dall'area vendibile reale: `m²vendibili = S×ED×CV` |
| C6 | `Ricavi_Attesi!E4` (prezzo base €/m²) | input manuale `0,1` (segnaposto) | Prezzo finto scollegato dal mercato | `prezzoBase = prezzoPrudente` dal foglio mercato |
| C7 | `Costi_Sviluppo` col. E/F | refs miste (`E7=D7*SUM(F4:F6)`, doppi calcoli) | Le colonne E ed F ricalcolano la stessa voce in modi diversi | Ogni costo calcolato secondo la colonna "Base calcolo" (manuale / %hard / %ricavi / %hard+soft) |

## Logica mantenuta identica (corretta nell'originale)

- **Gate documentale**: quarantena se mancano documenti critici.
- **Gate urbanistico**: bloccante se classificazione da verificare / edificabilità ≤ 0.
- **Peso comparabile**: `affidabilità × qualità / (1 + distanzaKm/10)`.
- **Residuale statico**: `ricavi − costi − margine×ricavi − premioRischio×ricavi`.
- **Verdetti** (statico, stress, dashboard) e relative soglie.
- **Cash flow trimestrale**, VAN, TIR, fattori di sconto.
- **Risk register**: score = probabilità × impatto €; gate bloccante.

## Soglia comparabili
Mantenuta la regola dura: **< 5 comparabili validi ⇒ "NON DECIDERE"** (non si calcola un prezzo affidabile).
