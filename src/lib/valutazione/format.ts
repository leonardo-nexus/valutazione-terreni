export const eur = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
export const eur2 = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0)
export const pct = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 1 }).format(n || 0)
export const num = (n: number, d = 0) =>
  new Intl.NumberFormat('it-IT', { maximumFractionDigits: d }).format(n || 0)
