import { getLang, getDict } from '@/lib/i18n'
import { getInputDefault } from '@/lib/valutazione/defaults'
import { GUIDE } from '@/lib/valutazione/guide'
import Valutatore from './Valutatore'

export async function generateMetadata() {
  const t = getDict(await getLang())
  return { title: `Proenesys · ${t.nav.app}` }
}

export default async function Page() {
  const lang = await getLang()
  const t = getDict(lang)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-7">
        <p className="section-title">{t.page.eyebrow}</p>
        <h1 className="brand-font mt-1 text-4xl font-semibold text-[var(--text)]">{t.page.titolo}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.page.sottotitolo}</p>
      </header>
      <Valutatore t={t} guide={GUIDE[lang]} defaultInput={getInputDefault(lang)} />
    </main>
  )
}
