import { setLang } from '@/app/actions/lang'
import type { Lang } from '@/lib/i18n'

// Server component: usa <form> con server action → robusto, non dipende dall'hydration.
export default function LanguageSwitch({ current }: { current: Lang }) {
  const cls = (l: Lang) =>
    `px-1.5 py-0.5 rounded ${current === l ? 'text-[var(--gold)] font-semibold' : 'text-[var(--muted)] hover:text-[var(--gold)]'}`
  return (
    <span className="flex items-center gap-0.5 text-xs">
      <form action={setLang.bind(null, 'it')}>
        <button type="submit" className={cls('it')}>IT</button>
      </form>
      <span className="text-[var(--border-gold)]">|</span>
      <form action={setLang.bind(null, 'es')}>
        <button type="submit" className={cls('es')}>ES</button>
      </form>
    </span>
  )
}
